import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Briefcase,
  GraduationCap,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/marketing/container";
import { Button } from "@/components/ui/button";
import { BOARD_HOME_PATH } from "@/config/nav";

import { eteneshBrand } from "./brand";
import { CourseIntro } from "./course-intro";
import { courses } from "./courses";
import { getTranslation } from "./language-server";

const pathways = [
  {
    description: "Explore open roles by company, location, or type of work.",
    href: BOARD_HOME_PATH,
    icon: Briefcase,
    title: "Browse jobs",
  },
  {
    description: "Get practical advice on CVs, applications, and interviews.",
    href: "/blog",
    icon: BookOpen,
    title: "Career guides",
  },
  {
    description: "Follow structured lessons and practice at your own pace.",
    href: "/courses",
    icon: GraduationCap,
    title: "Courses",
  },
] as const;

export async function CareerHero() {
  const t = await getTranslation();

  return (
    <div data-testid="career-home">
      <section className="bg-muted relative isolate overflow-hidden border-b">
        <Container className="grid items-center gap-10 py-14 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <p className="bg-card text-accent-foreground mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold">
              <span
                aria-hidden="true"
                className="bg-secondary size-2 rounded-full"
              />
              {t("Careers in Ethiopia")}
            </p>
            <h1 className="text-[clamp(2.75rem,6vw,5rem)] leading-[1.06] font-bold tracking-tight text-balance">
              {t("Find your next role.")}{" "}
              <span className="text-accent-foreground">
                {t("Get ready for it.")}
              </span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty">
              {t(
                "Browse jobs in Ethiopia and learn how to write a stronger CV, prepare for interviews, and apply with confidence."
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="min-h-12 px-5 text-base">
                <Link href={BOARD_HOME_PATH}>
                  {t("Browse jobs")} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                className="min-h-12 px-5 text-base"
                variant="outline"
              >
                <a href="#career-pathways">
                  {t("Explore resources")} <ArrowDown aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
          <div className="bg-card relative overflow-hidden rounded-3xl border p-5 shadow-xl sm:p-8">
            <div
              aria-hidden="true"
              className="from-primary via-chart-3 to-secondary absolute inset-x-0 top-0 h-1 bg-gradient-to-r"
            />
            <div className="mb-6 flex items-center gap-4">
              <Image
                alt=""
                className="bg-logo-background size-16 rounded-xl border object-contain p-1"
                height={64}
                src={eteneshBrand.logo}
                unoptimized
                width={64}
              />
              <div>
                <p className="text-lg font-bold">Etenesh HR Insights</p>
                <p className="text-muted-foreground text-sm">
                  Human Capital Solutions
                </p>
              </div>
            </div>
            <Link
              className="bg-background text-muted-foreground hover:border-primary hover:text-foreground flex min-h-14 items-center gap-3 rounded-xl border px-4 font-medium"
              href={BOARD_HOME_PATH}
            >
              <Search aria-hidden="true" className="size-5" />
              {t("Search jobs")}
              <ArrowRight aria-hidden="true" className="ml-auto size-5" />
            </Link>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {pathways.slice(1).map(({ href, icon: Icon, title }) => (
                <Link
                  className="bg-accent text-accent-foreground flex min-h-14 items-center gap-3 rounded-xl px-4 font-semibold hover:underline"
                  href={href}
                  key={href}
                >
                  <Icon aria-hidden="true" className="size-5 shrink-0" />{" "}
                  {t(title)}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="scroll-mt-24 py-14 md:py-20" id="career-pathways">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t("What would you like to do next?")}
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {pathways.map(({ description, href, icon: Icon, title }) => (
              <Link
                className="group bg-card hover:border-primary flex flex-col rounded-2xl border p-6 transition-colors"
                href={href}
                key={href}
              >
                <span className="bg-accent text-accent-foreground mb-5 grid size-12 place-items-center rounded-xl">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="flex items-center justify-between gap-3 text-xl font-bold">
                  {t(title)}
                  <ArrowRight
                    aria-hidden="true"
                    className="text-accent-foreground size-5 shrink-0 transition-transform group-hover:translate-x-1"
                  />
                </h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {t(description)}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-muted border-y py-14 md:py-20">
        <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="text-accent-foreground mb-3 text-sm font-semibold">
              {t("Course introduction")}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
              {t(
                "Get step-by-step help with your job search, CV, and interviews."
              )}
            </h2>
            <ul className="mt-6 grid gap-2">
              {courses.map((course) => (
                <li key={course.slug}>
                  <Link
                    className="bg-card hover:border-primary hover:text-accent-foreground flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 font-medium"
                    href={`/courses/${course.slug}`}
                  >
                    {t(course.title)}{" "}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <CourseIntro
            heading={t("Course introduction")}
            watchLabel={t("Watch on YouTube")}
          />
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="bg-accent flex flex-wrap items-center justify-between gap-6 rounded-2xl border p-6 sm:p-9">
            <h2 className="max-w-xl text-2xl font-bold tracking-tight text-balance md:text-3xl">
              {t("Ready to find your next role?")}
            </h2>
            <Button asChild className="min-h-12 px-5 text-base">
              <Link href={BOARD_HOME_PATH}>
                {t("Browse jobs")} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
