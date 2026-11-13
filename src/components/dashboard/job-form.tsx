"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import {
  type JobFormInput,
  postJob,
  updateJob,
} from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { EDUCATION_LEVELS } from "@/lib/etenesh/vocab";

export const EMPTY_JOB: JobFormInput = {
  about: "",
  area: "",
  careerLevel: "Entry",
  category: "",
  city: "Addis Ababa",
  company: "",
  deadline: "",
  education: "None",
  employmentType: "full-time",
  minYearsExperience: "0",
  published: true,
  requiredSkills: "",
  requirements: "",
  responsibilities: "",
  salaryMax: "",
  salaryMin: "",
  screeningQuestions: "",
  summary: "",
  title: "",
  workplaceType: "onsite",
};

const CAREER = ["Internship", "Entry", "Junior", "Mid", "Senior", "Manager"];
const EMPLOYMENT = ["full-time", "part-time", "contract", "internship"];
const WORKPLACE = ["onsite", "hybrid", "remote"];

function Field({
  children,
  hint,
  label,
}: {
  children: React.ReactNode;
  hint?: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[15px]">{label}</Label>
      {children}
      {hint ? <p className="text-muted-foreground text-sm">{hint}</p> : null}
    </div>
  );
}

function Pick({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="h-10 w-full text-[15px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// One form for posting a new job and for editing one. Editing leaves the
// long description alone.
export function JobForm({
  companies,
  editId,
  initial = EMPTY_JOB,
}: {
  companies: string[];
  editId?: number;
  initial?: JobFormInput;
}) {
  const router = useRouter();
  const [form, setForm] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();
  const editing = editId !== undefined;
  const set =
    <K extends keyof JobFormInput>(key: K) =>
    (value: JobFormInput[K]) =>
      setForm((current) => ({ ...current, [key]: value }));
  const text =
    (key: keyof JobFormInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(key)(event.target.value as never);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = editing
        ? await updateJob(editId, form)
        : await postJob(form);
      if (result.ok) {
        toast.success(editing ? "Job updated" : "Job posted");
        router.push(`/dashboard/jobs/${result.id}`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not save the job.");
      }
    });
  }

  return (
    <form
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:gap-6 md:p-6"
      onSubmit={submit}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">The job</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Job title">
              <Input
                className="h-10 text-[15px]"
                onChange={text("title")}
                required
                value={form.title}
              />
            </Field>
          </div>
          {editing ? null : (
            <>
              <Field label="Company">
                <Input
                  className="h-10 text-[15px]"
                  list="company-names"
                  onChange={text("company")}
                  required
                  value={form.company}
                />
                <datalist id="company-names">
                  {companies.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Field>
              <Field hint="For example Accounting, Sales." label="Category">
                <Input
                  className="h-10 text-[15px]"
                  onChange={text("category")}
                  required
                  value={form.category}
                />
              </Field>
              <Field label="City">
                <Input
                  className="h-10 text-[15px]"
                  onChange={text("city")}
                  required
                  value={form.city}
                />
              </Field>
              <Field label="Area (optional)">
                <Input
                  className="h-10 text-[15px]"
                  onChange={text("area")}
                  value={form.area}
                />
              </Field>
              <Field label="Level">
                <Pick
                  onChange={set("careerLevel")}
                  options={CAREER}
                  value={form.careerLevel}
                />
              </Field>
              <Field label="Type">
                <Pick
                  onChange={set("employmentType")}
                  options={EMPLOYMENT}
                  value={form.employmentType}
                />
              </Field>
              <Field label="Workplace">
                <Pick
                  onChange={set("workplaceType")}
                  options={WORKPLACE}
                  value={form.workplaceType}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Salary from (ETB)">
                  <Input
                    className="h-10 text-[15px]"
                    inputMode="numeric"
                    onChange={text("salaryMin")}
                    value={form.salaryMin}
                  />
                </Field>
                <Field label="Salary to (ETB)">
                  <Input
                    className="h-10 text-[15px]"
                    inputMode="numeric"
                    onChange={text("salaryMax")}
                    value={form.salaryMax}
                  />
                </Field>
              </div>
            </>
          )}
          <Field label="Closing date">
            <Input
              className="h-10 text-[15px]"
              onChange={text("deadline")}
              required
              type="date"
              value={form.deadline}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field
              hint="Two or three sentences about the role."
              label="Short summary"
            >
              <Textarea
                className="min-h-24 text-[15px]"
                onChange={text("summary")}
                required
                value={form.summary}
              />
            </Field>
          </div>
          {editing ? null : (
            <>
              <div className="sm:col-span-2">
                <Field label="About the company (optional)">
                  <Textarea
                    className="min-h-20 text-[15px]"
                    onChange={text("about")}
                    value={form.about}
                  />
                </Field>
              </div>
              <Field hint="One per line." label="Responsibilities">
                <Textarea
                  className="min-h-28 text-[15px]"
                  onChange={text("responsibilities")}
                  value={form.responsibilities}
                />
              </Field>
              <Field hint="One per line." label="Requirements">
                <Textarea
                  className="min-h-28 text-[15px]"
                  onChange={text("requirements")}
                  value={form.requirements}
                />
              </Field>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Who can apply</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Minimum years of experience">
            <Input
              className="h-10 text-[15px]"
              inputMode="numeric"
              min={0}
              onChange={text("minYearsExperience")}
              type="number"
              value={form.minYearsExperience}
            />
          </Field>
          <Field label="Minimum education">
            <Pick
              onChange={set("education")}
              options={EDUCATION_LEVELS}
              value={form.education}
            />
          </Field>
          <Field
            hint="Separate with commas or new lines."
            label="Skills to check"
          >
            <Textarea
              className="min-h-24 text-[15px]"
              onChange={text("requiredSkills")}
              value={form.requiredSkills}
            />
          </Field>
          <Field hint="One per line." label="Questions for applicants">
            <Textarea
              className="min-h-24 text-[15px]"
              onChange={text("screeningQuestions")}
              value={form.screeningQuestions}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-[15px]">
          <Checkbox
            checked={form.published}
            onCheckedChange={(value) => set("published")(value === true)}
          />
          Show on the job board
        </Label>
        <Button
          className="h-11 px-6 text-[15px]"
          disabled={pending}
          type="submit"
        >
          {editing ? "Save changes" : "Post job"}
        </Button>
      </div>
    </form>
  );
}
