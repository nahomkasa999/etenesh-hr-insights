import { RichText } from "@payloadcms/richtext-lexical/react";
import { IconCircleCheck } from "@tabler/icons-react";

import { CollapsibleCard } from "@/components/dashboard/collapsible-card";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/payload-types";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "Africa/Addis_Ababa",
  year: "numeric",
});

function Group({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">{label}</p>
      {children}
    </div>
  );
}

// What the job is, so HR can judge an applicant without leaving the page.
export function JobBrief({
  defaultOpen,
  job,
}: {
  defaultOpen?: boolean;
  job: Job;
}) {
  const criteria = job.criteria;
  const musts = [
    criteria?.minYearsExperience
      ? `${criteria.minYearsExperience}+ years of experience`
      : null,
    criteria?.education && criteria.education !== "None"
      ? `${criteria.education} or higher`
      : null,
  ].filter(Boolean) as string[];
  const skills = criteria?.requiredSkills ?? [];
  const questions = criteria?.screeningQuestions ?? [];
  const facts = [
    job.companyName,
    job.locationDisplay,
    job.validThrough
      ? `Closes ${dateFormat.format(new Date(job.validThrough))}`
      : null,
  ].filter(Boolean);

  return (
    <CollapsibleCard
      defaultOpen={defaultOpen}
      description={facts.join(" · ")}
      title={job.title}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Group label="Must have">
          {musts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {musts.map((item) => (
                <Badge
                  className="h-7 px-2.5 text-sm"
                  key={item}
                  variant="outline"
                >
                  {item}
                </Badge>
              ))}
            </div>
          ) : (
            <p>No minimum</p>
          )}
        </Group>
        <Group label="Skills checked">
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  className="h-7 px-2.5 text-sm"
                  key={skill.id ?? skill.value}
                >
                  {skill.value}
                </Badge>
              ))}
            </div>
          ) : (
            <p>None</p>
          )}
        </Group>
      </div>
      {questions.length > 0 ? (
        <Group label="Questions applicants answer">
          <ol className="flex flex-col gap-1.5">
            {questions.map((item, index) => (
              <li className="flex gap-2" key={item.id ?? item.question}>
                <IconCircleCheck className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <span>
                  {index + 1}. {item.question}
                </span>
              </li>
            ))}
          </ol>
        </Group>
      ) : null}
      {job.description ? (
        <Group label="Job description">
          <div className="flex max-w-none flex-col gap-2 leading-6 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5">
            <RichText data={job.description} />
          </div>
        </Group>
      ) : null}
    </CollapsibleCard>
  );
}
