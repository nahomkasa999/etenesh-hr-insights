"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  canContinue,
  formatFileSize,
  missedRequirements,
  parseYears,
} from "@/components/apply/eligibility";
import { BUTTON_CLASS } from "@/components/apply/field";
import {
  type Errors,
  type FormState,
  StepCheck,
  StepDetails,
  StepQuestions,
  StepReview,
  type Update,
} from "@/components/apply/steps";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApplyJob, ApplyProfile } from "@/lib/etenesh/apply";

const CV_MAX_BYTES = 4 * 1024 * 1024;
const CV_EXTENSIONS = [".pdf", ".doc", ".docx"];
const STEP_TITLES = [
  "Check you can apply",
  "Your details",
  "Questions from the employer",
  "Review",
] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const NON_DIGIT_RE = /\D/gu;
const MIN_PHONE_DIGITS = 9;

type BannerKind = "closed" | "form" | "missed" | "network";
interface Banner {
  kind: BannerKind;
  text: string[];
}

const BANNER_TITLES: Record<BannerKind, string> = {
  closed: "This job is closed",
  form: "Your application was not sent",
  missed: "You do not meet the minimum requirements",
  network: "Your application was not sent",
};

type Load =
  | { kind: "loading" }
  | { kind: "closed" }
  | { kind: "error" }
  | { kind: "ready"; job: LoadedJob };

interface ServerReply {
  errors?: Errors;
  missed?: string[];
  ok?: boolean;
  reason?: string;
  reference?: string;
}

// Which step each server field lives on.
function stepOfField(key: string): number {
  if (key === "education" || key === "yearsExperience" || key === "skills") {
    return 0;
  }
  if (key.startsWith("answer-")) {
    return 2;
  }
  return 1;
}

function firstStep(errors: Errors): number {
  return Math.min(...Object.keys(errors).map(stepOfField));
}

function checkCv(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!CV_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "Your CV must be a PDF or Word file (.pdf, .doc or .docx).";
  }
  if (file.size > CV_MAX_BYTES) {
    return `This file is ${formatFileSize(file.size)}. Please choose a file smaller than 4 MB.`;
  }
  if (file.size === 0) {
    return "This file is empty. Please choose another file.";
  }
  return null;
}

function validateCheck(state: FormState): Errors {
  const errors: Errors = {};
  if (parseYears(state.yearsExperience) === null) {
    errors.yearsExperience =
      "Type a whole number, for example 3. Type 0 if none.";
  }
  if (!state.education) {
    errors.education = "Please choose your highest education.";
  }
  return errors;
}

function validateDetails(state: FormState): Errors {
  const errors: Errors = {};
  if (state.fullName.trim().length < 2) {
    errors.fullName = "Please type your full name.";
  }
  if (!EMAIL_RE.test(state.email.trim())) {
    errors.email = "Please type a valid email, like name@example.com.";
  }
  if (state.phone.replace(NON_DIGIT_RE, "").length < MIN_PHONE_DIGITS) {
    errors.phone = "Please type your phone number, for example 0911 223344.";
  }
  if (state.city.trim().length === 0) {
    errors.city = "Please type the city where you live.";
  }
  let cvError: string | null = null;
  if (state.cv) {
    cvError = checkCv(state.cv);
  } else if (!state.savedCv) {
    cvError = "Please choose your CV file.";
  }
  if (cvError) {
    errors.cv = cvError;
  }
  return errors;
}

function validateQuestions(state: FormState, job: ApplyJob): Errors {
  const errors: Errors = {};
  job.questions.forEach((_, index) => {
    if ((state.answers[index] ?? "").trim().length === 0) {
      errors[`answer-${index}`] = "Please write an answer.";
    }
  });
  return errors;
}

function buildBody(state: FormState, job: ApplyJob): FormData {
  const body = new FormData();
  body.set("jobId", String(job.id));
  body.set("fullName", state.fullName.trim());
  body.set("email", state.email.trim());
  body.set("phone", state.phone.trim());
  body.set("city", state.city.trim());
  body.set("yearsExperience", String(parseYears(state.yearsExperience)));
  body.set("education", state.education);
  for (const skill of state.skills) {
    body.append("skills", skill);
  }
  for (const answer of state.answers) {
    body.append("answers", answer.trim());
  }
  body.set("coverNote", state.coverNote.trim());
  if (state.cv) {
    body.set("cv", state.cv);
  } else if (state.savedCv) {
    body.set("useSavedCv", "1");
  }
  return body;
}

const EMPTY_STATE: FormState = {
  answers: [],
  city: "",
  coverNote: "",
  cv: null,
  education: "",
  email: "",
  fullName: "",
  phone: "",
  savedCv: null,
  skills: [],
  yearsExperience: "",
};

type LoadedJob = ApplyJob & { me?: ApplyProfile | null };

// A signed-in candidate's profile fills the form. Only skills the job lists
// are ticked, since the form ticks from the job's own list.
function initialState(job: LoadedJob): FormState {
  const base = { ...EMPTY_STATE, answers: job.questions.map(() => "") };
  const { me } = job;
  if (!me) {
    return base;
  }
  const have = new Set(me.skills.map((skill) => skill.trim().toLowerCase()));
  return {
    ...base,
    city: me.city,
    education: me.education,
    email: me.email,
    fullName: me.fullName,
    phone: me.phone,
    savedCv: me.cv,
    skills: job.skills.filter((skill) => have.has(skill.trim().toLowerCase())),
    yearsExperience: me.yearsExperience,
  };
}

function useJob(jobId: string) {
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoad({ kind: "loading" });
    fetch(`/api/apply?jobId=${encodeURIComponent(jobId)}&_=${attempt}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 404) {
          setLoad({ kind: "closed" });
        } else if (response.ok) {
          setLoad({
            job: (await response.json()) as LoadedJob,
            kind: "ready",
          });
        } else {
          setLoad({ kind: "error" });
        }
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") {
          setLoad({ kind: "error" });
        }
      });
    return () => controller.abort();
  }, [jobId, attempt]);

  return { load, retry };
}

function LoadProblem({
  kind,
  onRetry,
}: {
  kind: "closed" | "error";
  onRetry: () => void;
}) {
  if (kind === "closed") {
    return (
      <Alert variant="destructive">
        <XCircle />
        <AlertTitle className="line-clamp-none">This job is closed</AlertTitle>
        <AlertDescription className="text-sm">
          We are not taking applications for this job any more. Please look at
          our other open jobs.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle className="line-clamp-none">
        We could not load the form
      </AlertTitle>
      <AlertDescription className="text-sm">
        Please check your internet and try again.
        <Button
          className={`${BUTTON_CLASS} mt-3`}
          onClick={onRetry}
          type="button"
          variant="outline"
        >
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function FormSkeleton() {
  return (
    <div
      aria-busy="true"
      className="flex flex-col gap-4"
      data-testid="apply-loading"
    >
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-40" />
    </div>
  );
}

function Success({ job, reference }: { job: ApplyJob; reference: string }) {
  return (
    <div className="flex flex-col gap-5" data-testid="apply-success">
      <div className="flex items-center gap-3">
        <CheckCircle2
          aria-hidden="true"
          className="size-8 shrink-0 text-green-600"
        />
        <h3 className="text-foreground text-xl leading-7 font-medium">
          We received your application
        </h3>
      </div>
      <div className="bg-card ring-line flex flex-col gap-1 rounded-xl p-5 text-center ring-1 ring-inset">
        <p className="text-muted-foreground text-sm">Your reference number</p>
        <p
          className="text-foreground text-3xl font-semibold tracking-wide"
          data-testid="apply-reference"
        >
          {reference}
        </p>
      </div>
      <p className="text-foreground text-base leading-6 font-medium">
        Save this number. You will need it to ask about your application.
      </p>
      <p className="text-muted-foreground text-sm leading-5">
        We sent your application for {job.title} at {job.companyName} to our
        team.
      </p>
      <a
        className="text-foreground text-sm font-medium underline underline-offset-2"
        href="/account/applications"
      >
        Track your applications
      </a>
    </div>
  );
}

function SubmitButton({
  onSubmit,
  submitting,
}: {
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <Button
      className="h-12 px-6 text-base"
      data-testid="apply-submit"
      disabled={submitting}
      onClick={onSubmit}
      type="button"
    >
      {submitting ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send aria-hidden="true" className="size-4" />
          Submit application
        </>
      )}
    </Button>
  );
}

// Anyone can read jobs; applying needs an account so it can be tracked.
function SignInToApply({ slug }: { slug: string }) {
  const next = encodeURIComponent(`/jobs/${slug}#apply`);
  return (
    <div
      className="bg-surface-sub flex flex-col gap-3 rounded-xl p-5"
      data-testid="apply-sign-in"
    >
      <h3 className="text-foreground text-lg leading-6 font-medium">
        Sign in to apply
      </h3>
      <p className="text-muted-foreground text-sm leading-5">
        Create a free account or sign in. Your details and CV are saved, so the
        next application takes one tap, and you can track every application here
        and on Telegram.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium"
          href={`/signup?next=${next}`}
        >
          Create account
        </a>
        <a
          className="ring-line-strong text-foreground hover:bg-card inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium ring-1 ring-inset"
          href={`/signin?next=${next}`}
        >
          Sign in
        </a>
      </div>
    </div>
  );
}

export function ApplyForm({
  jobId,
  onDone,
}: {
  jobId: string;
  onDone?: (reference: string) => void;
}) {
  const { load, retry } = useJob(jobId);
  if (load.kind === "loading") {
    return <FormSkeleton />;
  }
  if (load.kind !== "ready") {
    return <LoadProblem kind={load.kind} onRetry={retry} />;
  }
  if (!load.job.me) {
    return <SignInToApply slug={load.job.slug} />;
  }
  return <ApplyWizard job={load.job} onDone={onDone} />;
}

function ApplyWizard({
  job,
  onDone,
}: {
  job: LoadedJob;
  onDone?: (reference: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [state, setState] = useState<FormState>(() => initialState(job));
  const root = useRef<HTMLDivElement>(null);

  const scrollTop = useCallback(() => {
    requestAnimationFrame(() =>
      root.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      if (!(key in prev)) {
        return prev;
      }
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, []);

  const update = useCallback<Update>(
    (key, value) => {
      setState((prev) => ({ ...prev, [key]: value }));
      clearError(key);
    },
    [clearError]
  );

  const onAnswer = useCallback(
    (index: number, value: string) => {
      setState((prev) => {
        const answers = [...prev.answers];
        answers[index] = value;
        return { ...prev, answers };
      });
      clearError(`answer-${index}`);
    },
    [clearError]
  );

  const onCvProblem = useCallback(
    (message: string) => setErrors((prev) => ({ ...prev, cv: message })),
    []
  );

  const goTo = useCallback(
    (to: number) => {
      setBanner(null);
      setStep(to);
      scrollTop();
    },
    [scrollTop]
  );

  const requirements = {
    education: job.education,
    minYearsExperience: job.minYearsExperience,
  };
  const profile = {
    education: state.education,
    yearsExperience: state.yearsExperience,
  };
  const missed = missedRequirements(requirements, profile);
  const eligible = canContinue(requirements, profile);

  const back = useCallback(() => goTo(step - 1), [goTo, step]);

  const next = useCallback(() => {
    const checks = [
      () => validateCheck(state),
      () => validateDetails(state),
      () => validateQuestions(state, job),
    ];
    const found = checks[step]?.() ?? {};
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() =>
        root.current
          ?.querySelector("[data-field-error]")
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      );
      return;
    }
    if (step === 0 && !eligible) {
      return;
    }
    goTo(step + 1);
  }, [eligible, goTo, job, state, step]);

  const handleReply = useCallback(
    (status: number, data: ServerReply | null) => {
      if (status === 201 && data?.reference) {
        setReference(data.reference);
        onDone?.(data.reference);
        scrollTop();
        return;
      }
      if (status === 409 || data?.reason === "closed") {
        setBanner({
          kind: "closed",
          text: [
            "This job has just closed, so we could not take your application. Sorry about that.",
          ],
        });
        return;
      }
      if (status === 422 && data?.reason === "not_eligible") {
        goTo(0);
        setBanner({
          kind: "missed",
          text: data.missed ?? ["You do not meet the minimum requirements."],
        });
        return;
      }
      if (status === 400 && data?.errors) {
        const { form, ...fieldErrors } = data.errors;
        setErrors(fieldErrors);
        if (Object.keys(fieldErrors).length > 0) {
          goTo(firstStep(fieldErrors));
        }
        if (form) {
          setBanner({ kind: "form", text: [form] });
        }
        return;
      }
      setBanner({
        kind: "network",
        text: [
          "Something went wrong on our side. Nothing you typed is lost. Please try again.",
        ],
      });
    },
    [goTo, onDone, scrollTop]
  );

  const submit = useCallback(async () => {
    const found = {
      ...validateCheck(state),
      ...validateDetails(state),
      ...validateQuestions(state, job),
    };
    if (Object.keys(found).length > 0) {
      setErrors(found);
      goTo(firstStep(found));
      return;
    }
    if (!eligible) {
      goTo(0);
      return;
    }
    setSubmitting(true);
    setBanner(null);
    try {
      const response = await fetch("/api/apply", {
        body: buildBody(state, job),
        method: "POST",
      });
      const data = (await response
        .json()
        .catch(() => null)) as ServerReply | null;
      handleReply(response.status, data);
    } catch {
      setBanner({
        kind: "network",
        text: [
          "We could not reach the internet. Nothing you typed is lost. Please check your connection and press Submit again.",
        ],
      });
    } finally {
      setSubmitting(false);
    }
  }, [eligible, goTo, handleReply, job, state]);

  if (reference) {
    return <Success job={job} reference={reference} />;
  }

  const stepNumber = step + 1;
  const blocked = step === 0 && missed.length > 0;

  return (
    <div className="flex flex-col gap-5" data-testid="apply-form" ref={root}>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-foreground text-lg leading-6 font-medium">
            {STEP_TITLES[step]}
          </h3>
          <Badge className="h-auto px-2.5 py-1 text-sm" variant="secondary">
            Step {stepNumber} of 4
          </Badge>
        </div>
        <Progress
          aria-label={`Step ${stepNumber} of 4`}
          className="h-2"
          value={(stepNumber / 4) * 100}
        />
      </div>

      <p
        className="bg-surface-sub text-muted-foreground rounded-lg px-3 py-2 text-sm leading-5"
        data-testid="apply-signed-in"
      >
        Filled in from your profile. Check it and continue.
      </p>

      {banner ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle className="line-clamp-none">
            {BANNER_TITLES[banner.kind]}
          </AlertTitle>
          <AlertDescription className="text-sm">
            <ul className="flex flex-col gap-1">
              {banner.text.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      {step === 0 ? (
        <StepCheck
          errors={errors}
          job={job}
          missed={missed}
          onChange={update}
          requirements={requirements}
          state={state}
        />
      ) : null}
      {step === 1 ? (
        <StepDetails
          checkCv={checkCv}
          errors={errors}
          onChange={update}
          onCvProblem={onCvProblem}
          state={state}
        />
      ) : null}
      {step === 2 ? (
        <StepQuestions
          errors={errors}
          job={job}
          onAnswer={onAnswer}
          onChange={update}
          state={state}
        />
      ) : null}
      {step === 3 ? (
        <StepReview
          hasErrors={Object.keys(errors).length > 0}
          job={job}
          onGo={goTo}
          state={state}
        />
      ) : null}

      <Separator />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 0 ? (
          <Button
            className={BUTTON_CLASS}
            disabled={submitting}
            onClick={back}
            type="button"
            variant="outline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </Button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <Button
            className={BUTTON_CLASS}
            data-testid="apply-continue"
            disabled={blocked}
            onClick={next}
            type="button"
          >
            Continue
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        ) : (
          <SubmitButton onSubmit={submit} submitting={submitting} />
        )}
      </div>
    </div>
  );
}
