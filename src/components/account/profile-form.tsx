"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useCallback, useState } from "react";

import { ChipsInput, ToggleChips } from "@/components/account/chips-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  JOB_EMPLOYMENT_LABELS,
  JOB_EMPLOYMENT_TYPES,
  JOB_WORKPLACE_LABELS,
  JOB_WORKPLACE_TYPES,
  type JobEmploymentType,
  type JobWorkplaceType,
} from "@/lib/domain/job-vocab";
import { EDUCATION_LEVELS } from "@/lib/etenesh/vocab";

export interface ProfileValues {
  city: string;
  education: string;
  fullName: string;
  headline: string;
  phone: string;
  preferredCategories: string[];
  preferredLocations: string[];
  preferredTypes: JobEmploymentType[];
  preferredWorkplaces: JobWorkplaceType[];
  skills: string[];
  summary: string;
  yearsExperience: string;
}

const TYPE_OPTIONS = JOB_EMPLOYMENT_TYPES.filter(
  (type) => type !== "other" && type !== "per-diem"
).map((value) => ({ label: JOB_EMPLOYMENT_LABELS[value], value }));
const WORKPLACE_OPTIONS = JOB_WORKPLACE_TYPES.map((value) => ({
  label: JOB_WORKPLACE_LABELS[value],
  value,
}));

const SELECT_CLASS =
  "bg-card text-foreground ring-line-strong h-11 w-full rounded-lg px-3 text-base ring-1 ring-inset md:text-sm";

function Row({
  children,
  error,
  hint,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  hint?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm" htmlFor={htmlFor}>
        {label}
      </Label>
      {children}
      {hint && !error ? (
        <p className="text-subtle text-[13px] leading-5">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-destructive text-[13px] leading-5">{error}</p>
      ) : null}
    </div>
  );
}

export function ProfileForm({
  categories,
  initial,
  skillSuggestions,
}: {
  categories: string[];
  initial: ProfileValues;
  skillSuggestions: string[];
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  const set = useCallback((key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }, []);
  // Text fields, the select and the textarea carry their key as `name`.
  const onText = useCallback(
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => set(event.currentTarget.name, event.currentTarget.value),
    [set]
  );

  const onSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setStatus("saving");
      setErrors({});
      const years = values.yearsExperience.trim();
      const response = await fetch("/api/account/profile", {
        body: JSON.stringify({
          ...values,
          education: values.education || null,
          yearsExperience: years === "" ? null : Number(years),
        }),
        headers: { "content-type": "application/json" },
        method: "PUT",
      }).catch(() => null);
      if (response?.ok) {
        setStatus("saved");
        router.refresh();
        return;
      }
      const data = (await response?.json().catch(() => null)) as {
        errors?: Record<string, string>;
      } | null;
      setErrors(data?.errors ?? {});
      setStatus("error");
    },
    [router, values]
  );

  return (
    <form
      className="flex flex-col gap-6"
      data-testid="profile-form"
      onSubmit={onSubmit}
    >
      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="text-foreground mb-3 text-base font-medium">
          About you
        </legend>
        <Row error={errors.fullName} htmlFor="p-name" label="Full name">
          <Input
            autoComplete="name"
            className="h-11 text-base md:text-sm"
            id="p-name"
            name="fullName"
            onChange={onText}
            value={values.fullName}
          />
        </Row>
        <Row error={errors.phone} htmlFor="p-phone" label="Phone">
          <Input
            autoComplete="tel"
            className="h-11 text-base md:text-sm"
            id="p-phone"
            inputMode="tel"
            name="phone"
            onChange={onText}
            placeholder="0911 234 567"
            value={values.phone}
          />
        </Row>
        <Row error={errors.city} htmlFor="p-city" label="City where you live">
          <Input
            autoComplete="address-level2"
            className="h-11 text-base md:text-sm"
            id="p-city"
            name="city"
            onChange={onText}
            placeholder="Addis Ababa"
            value={values.city}
          />
        </Row>
        <Row
          error={errors.headline}
          hint="One line, for example: Accountant with 4 years in banking."
          htmlFor="p-headline"
          label="Headline"
        >
          <Input
            className="h-11 text-base md:text-sm"
            id="p-headline"
            name="headline"
            onChange={onText}
            value={values.headline}
          />
        </Row>
        <Row
          error={errors.yearsExperience}
          htmlFor="p-years"
          label="Years of work experience"
        >
          <Input
            className="h-11 text-base md:text-sm"
            id="p-years"
            inputMode="numeric"
            max={60}
            min={0}
            name="yearsExperience"
            onChange={onText}
            type="number"
            value={values.yearsExperience}
          />
        </Row>
        <Row
          error={errors.education}
          htmlFor="p-education"
          label="Highest education"
        >
          <select
            className={SELECT_CLASS}
            id="p-education"
            name="education"
            onChange={onText}
            value={values.education}
          >
            <option value="">Choose…</option>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </Row>
        <div className="md:col-span-2">
          <Row error={errors.summary} htmlFor="p-summary" label="Short summary">
            <Textarea
              className="min-h-24 text-base md:text-sm"
              id="p-summary"
              name="summary"
              onChange={onText}
              placeholder="What you are good at and what you want next."
              value={values.summary}
            />
          </Row>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-foreground mb-3 text-base font-medium">
          Skills
        </legend>
        <Row
          error={errors.skills}
          hint="Type a skill and press Enter. Matching uses these first."
          htmlFor="p-skills"
          label="Your skills"
        >
          <ChipsInput
            id="p-skills"
            name="skills"
            onChange={set}
            placeholder="Excel, Customer service, Driving licence…"
            suggestions={skillSuggestions}
            value={values.skills}
          />
        </Row>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-foreground mb-3 text-base font-medium">
          What you are looking for
        </legend>
        <Row htmlFor="p-categories" label="Job categories">
          <ChipsInput
            id="p-categories"
            max={10}
            name="preferredCategories"
            onChange={set}
            placeholder="Pick from the list or type one"
            suggestions={categories}
            value={values.preferredCategories}
          />
        </Row>
        <Row htmlFor="p-locations" label="Places you can work">
          <ChipsInput
            id="p-locations"
            max={10}
            name="preferredLocations"
            onChange={set}
            placeholder="Addis Ababa, Adama…"
            value={values.preferredLocations}
          />
        </Row>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Job type</p>
          <ToggleChips
            label="Job type"
            name="preferredTypes"
            onChange={set}
            options={TYPE_OPTIONS}
            value={values.preferredTypes}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Workplace</p>
          <ToggleChips
            label="Workplace"
            name="preferredWorkplaces"
            onChange={set}
            options={WORKPLACE_OPTIONS}
            value={values.preferredWorkplaces}
          />
        </div>
      </fieldset>

      {status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription className="text-sm">
            {Object.keys(errors).length > 0
              ? "Please fix the fields marked above."
              : "We could not save your profile. Please try again."}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="bg-background/95 border-line sticky bottom-0 -mx-4 flex items-center gap-3 border-t px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:p-0">
        <Button
          className="h-11 px-6 text-sm"
          data-testid="profile-save"
          disabled={status === "saving"}
          type="submit"
        >
          {status === "saving" ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : null}
          Save profile
        </Button>
        {status === "saved" ? (
          <p
            className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400"
            role="status"
          >
            <CheckCircle2 aria-hidden="true" className="size-4" />
            Saved
          </p>
        ) : null}
      </div>
    </form>
  );
}
