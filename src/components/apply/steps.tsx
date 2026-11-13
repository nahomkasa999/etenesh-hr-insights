"use client";

import { CheckCircle2, Paperclip, Pencil, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

import {
  describeRequirements,
  formatFileSize,
  type Requirements,
} from "@/components/apply/eligibility";
import { BUTTON_CLASS, Field, INPUT_CLASS } from "@/components/apply/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ApplyJob } from "@/lib/etenesh/apply";
import { EDUCATION_LEVELS } from "@/lib/etenesh/vocab";

export type Errors = Record<string, string>;

export interface FormState {
  answers: string[];
  city: string;
  coverNote: string;
  cv: File | null;
  education: string;
  email: string;
  fullName: string;
  phone: string;
  // The CV on the candidate's profile; used when no new file is chosen.
  savedCv: { name: string; size: number } | null;
  skills: string[];
  yearsExperience: string;
}

export type Update = <K extends keyof FormState>(
  key: K,
  value: FormState[K]
) => void;

function TextField({
  autoComplete,
  error,
  id,
  inputMode,
  label,
  name,
  onChange,
  type,
  value,
}: {
  autoComplete?: string;
  error?: string;
  id: string;
  inputMode?: "email" | "numeric" | "tel";
  label: string;
  name: "city" | "email" | "fullName" | "phone" | "yearsExperience";
  onChange: Update;
  type?: string;
  value: string;
}) {
  const handle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      onChange(name, event.target.value),
    [name, onChange]
  );
  return (
    <Field error={error} htmlFor={id} label={label}>
      <Input
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={INPUT_CLASS}
        id={id}
        inputMode={inputMode}
        max={name === "yearsExperience" ? 60 : undefined}
        min={name === "yearsExperience" ? 0 : undefined}
        onChange={handle}
        type={type}
        value={value}
      />
    </Field>
  );
}

function SkillRow({
  checked,
  id,
  onToggle,
  skill,
}: {
  checked: boolean;
  id: string;
  onToggle: (skill: string, on: boolean) => void;
  skill: string;
}) {
  const handle = useCallback(
    (value: boolean | "indeterminate") => onToggle(skill, value === true),
    [onToggle, skill]
  );
  return (
    <div className="flex min-h-11 items-center gap-3">
      <Checkbox
        checked={checked}
        className="size-5"
        id={id}
        onCheckedChange={handle}
      />
      <Label className="text-sm leading-5 font-normal" htmlFor={id}>
        {skill}
      </Label>
    </div>
  );
}

export function StepCheck({
  errors,
  job,
  missed,
  onChange,
  requirements,
  state,
}: {
  errors: Errors;
  job: ApplyJob;
  missed: string[];
  onChange: Update;
  requirements: Requirements;
  state: FormState;
}) {
  const { skills } = state;
  const toggleSkill = useCallback(
    (skill: string, on: boolean) =>
      onChange(
        "skills",
        on ? [...skills, skill] : skills.filter((s) => s !== skill)
      ),
    [onChange, skills]
  );
  const alertRef = useRef<HTMLDivElement>(null);
  const blocked = missed.length > 0;
  // Bring the explanation into view so it is not missed on a small screen.
  useEffect(() => {
    if (blocked) {
      alertRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [blocked]);
  const setEducation = useCallback(
    (value: string) => onChange("education", value),
    [onChange]
  );
  return (
    <div className="flex flex-col gap-5">
      <p
        className="bg-muted text-foreground rounded-lg px-4 py-3 text-sm leading-5"
        data-testid="apply-requirements"
      >
        {describeRequirements(requirements)}
      </p>
      <TextField
        error={errors.yearsExperience}
        id="apply-years"
        inputMode="numeric"
        label="How many years of work experience do you have?"
        name="yearsExperience"
        onChange={onChange}
        type="number"
        value={state.yearsExperience}
      />
      <Field
        error={errors.education}
        htmlFor="apply-education"
        label="What is your highest education?"
      >
        <Select onValueChange={setEducation} value={state.education}>
          <SelectTrigger
            aria-invalid={Boolean(errors.education)}
            className="h-11 w-full text-sm data-[size=default]:h-11"
            id="apply-education"
          >
            <SelectValue placeholder="Choose one" />
          </SelectTrigger>
          <SelectContent>
            {EDUCATION_LEVELS.map((level) => (
              <SelectItem className="py-2.5 text-sm" key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {job.skills.length > 0 ? (
        <fieldset className="flex flex-col gap-1">
          <legend className="text-foreground mb-2 text-sm leading-5 font-medium">
            Tick the skills you have
          </legend>
          {job.skills.map((skill, index) => (
            <SkillRow
              checked={skills.includes(skill)}
              id={`apply-skill-${index}`}
              key={skill}
              onToggle={toggleSkill}
              skill={skill}
            />
          ))}
        </fieldset>
      ) : null}
      {missed.length > 0 ? (
        <Alert
          data-testid="apply-not-eligible"
          ref={alertRef}
          variant="destructive"
        >
          <XCircle />
          <AlertTitle className="line-clamp-none">
            Sorry, you cannot apply for this job
          </AlertTitle>
          <AlertDescription className="text-sm">
            <ul className="flex flex-col gap-1.5">
              {missed.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-2">
              Please look at our other open jobs. Thank you for your interest.
            </p>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

function cvLabel(state: FormState): string {
  if (state.cv) {
    return `${state.cv.name} (${formatFileSize(state.cv.size)})`;
  }
  if (state.savedCv) {
    return `${state.savedCv.name} (from your profile)`;
  }
  return "No file";
}

export function StepDetails({
  errors,
  onChange,
  onCvProblem,
  state,
  checkCv,
}: {
  checkCv: (file: File) => string | null;
  errors: Errors;
  onChange: Update;
  onCvProblem: (message: string) => void;
  state: FormState;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const pick = useCallback(() => fileInput.current?.click(), []);
  const onFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      onChange("cv", file);
      const problem = file ? checkCv(file) : null;
      if (problem) {
        onCvProblem(problem);
      }
    },
    [checkCv, onChange, onCvProblem]
  );
  return (
    <div className="flex flex-col gap-5">
      <TextField
        autoComplete="name"
        error={errors.fullName}
        id="apply-name"
        label="Full name"
        name="fullName"
        onChange={onChange}
        value={state.fullName}
      />
      <TextField
        autoComplete="email"
        error={errors.email}
        id="apply-email"
        inputMode="email"
        label="Email"
        name="email"
        onChange={onChange}
        type="email"
        value={state.email}
      />
      <TextField
        autoComplete="tel"
        error={errors.phone}
        id="apply-phone"
        inputMode="tel"
        label="Phone number"
        name="phone"
        onChange={onChange}
        type="tel"
        value={state.phone}
      />
      <TextField
        autoComplete="address-level2"
        error={errors.city}
        id="apply-city"
        label="City where you live"
        name="city"
        onChange={onChange}
        value={state.city}
      />
      <Field
        error={errors.cv}
        hint="PDF or Word file, smaller than 4 MB."
        htmlFor="apply-cv"
        label="Your CV"
      >
        <input
          accept=".pdf,.doc,.docx,application/pdf"
          className="sr-only"
          data-testid="apply-cv-input"
          id="apply-cv"
          onChange={onFile}
          ref={fileInput}
          type="file"
        />
        <Button
          aria-describedby="apply-cv-hint"
          className={`${BUTTON_CLASS} w-full justify-start`}
          onClick={pick}
          type="button"
          variant="outline"
        >
          <Paperclip aria-hidden="true" className="size-4" />
          {state.cv || state.savedCv
            ? "Choose a different file"
            : "Choose CV file"}
        </Button>
        {!state.cv && state.savedCv ? (
          <p
            className="text-foreground flex items-center gap-2 text-sm leading-5 break-all"
            data-testid="apply-cv-saved"
          >
            <CheckCircle2
              aria-hidden="true"
              className="size-4 shrink-0 text-green-600"
            />
            Using the CV on your profile: {state.savedCv.name} (
            {formatFileSize(state.savedCv.size)})
          </p>
        ) : null}
        {state.cv ? (
          <p
            className="text-foreground flex items-center gap-2 text-sm leading-5 break-all"
            data-testid="apply-cv-name"
          >
            <CheckCircle2
              aria-hidden="true"
              className="size-4 shrink-0 text-green-600"
            />
            {state.cv.name} ({formatFileSize(state.cv.size)})
          </p>
        ) : null}
      </Field>
    </div>
  );
}

function AnswerField({
  error,
  index,
  onAnswer,
  question,
  value,
}: {
  error?: string;
  index: number;
  onAnswer: (index: number, value: string) => void;
  question: string;
  value: string;
}) {
  const handle = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) =>
      onAnswer(index, event.target.value),
    [index, onAnswer]
  );
  return (
    <Field error={error} htmlFor={`apply-answer-${index}`} label={question}>
      <Textarea
        aria-invalid={Boolean(error)}
        className="min-h-28 text-base md:text-sm"
        id={`apply-answer-${index}`}
        maxLength={2000}
        onChange={handle}
        value={value}
      />
    </Field>
  );
}

export function StepQuestions({
  errors,
  job,
  onAnswer,
  onChange,
  state,
}: {
  errors: Errors;
  job: ApplyJob;
  onAnswer: (index: number, value: string) => void;
  onChange: Update;
  state: FormState;
}) {
  const onNote = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) =>
      onChange("coverNote", event.target.value),
    [onChange]
  );
  return (
    <div className="flex flex-col gap-5">
      {job.questions.map((question, index) => (
        <AnswerField
          error={errors[`answer-${index}`]}
          index={index}
          key={question}
          onAnswer={onAnswer}
          question={question}
          value={state.answers[index] ?? ""}
        />
      ))}
      <Field
        error={errors.coverNote}
        htmlFor="apply-note"
        label="Short note to the employer"
        optional
      >
        <Textarea
          className="min-h-24 text-base md:text-sm"
          id="apply-note"
          maxLength={3000}
          onChange={onNote}
          value={state.coverNote}
        />
      </Field>
    </div>
  );
}

function ReviewSection({
  children,
  onGo,
  step,
  title,
}: {
  children: React.ReactNode;
  onGo: (step: number) => void;
  step: number;
  title: string;
}) {
  const edit = useCallback(() => onGo(step), [onGo, step]);
  return (
    <section className="bg-card ring-line rounded-xl p-4 ring-1 ring-inset">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="text-foreground text-sm leading-5 font-medium">
          {title}
        </h4>
        <Button
          className="h-11 px-3 text-sm"
          onClick={edit}
          type="button"
          variant="ghost"
        >
          <Pencil aria-hidden="true" className="size-4" />
          Edit
          <span className="sr-only"> {title}</span>
        </Button>
      </div>
      <dl className="flex flex-col gap-2.5">{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-sm leading-5">{label}</dt>
      <dd className="text-foreground text-sm leading-5 break-words whitespace-pre-wrap">
        {value}
      </dd>
    </div>
  );
}

export function StepReview({
  hasErrors,
  job,
  onGo,
  state,
}: {
  hasErrors: boolean;
  job: ApplyJob;
  onGo: (step: number) => void;
  state: FormState;
}) {
  return (
    <div className="flex flex-col gap-4" data-testid="apply-review">
      <p className="text-muted-foreground text-sm leading-5">
        Please check your answers. Press Edit to change anything.
      </p>
      <ReviewSection onGo={onGo} step={0} title="Eligibility">
        <ReviewRow label="Years of experience" value={state.yearsExperience} />
        <ReviewRow label="Highest education" value={state.education} />
        <ReviewRow
          label="Skills"
          value={
            state.skills.length > 0 ? state.skills.join(", ") : "None ticked"
          }
        />
      </ReviewSection>
      <ReviewSection onGo={onGo} step={1} title="Your details">
        <ReviewRow label="Name" value={state.fullName} />
        <ReviewRow label="Email" value={state.email} />
        <ReviewRow label="Phone" value={state.phone} />
        <ReviewRow label="City" value={state.city} />
        <ReviewRow label="CV" value={cvLabel(state)} />
      </ReviewSection>
      <ReviewSection onGo={onGo} step={2} title="Questions">
        {job.questions.map((question, index) => (
          <ReviewRow
            key={question}
            label={question}
            value={state.answers[index] ?? ""}
          />
        ))}
        {state.coverNote.trim() ? (
          <ReviewRow label="Note" value={state.coverNote} />
        ) : null}
      </ReviewSection>
      {hasErrors ? (
        <p className="text-destructive text-sm leading-5">
          Some answers need fixing. Press Edit next to them.
        </p>
      ) : null}
    </div>
  );
}
