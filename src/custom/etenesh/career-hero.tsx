import { BookOpen, Briefcase, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/marketing/container";
import { Section } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";
import { BOARD_HOME_PATH } from "@/config/nav";

import { eteneshBrand } from "./brand";
import { getTranslation } from "./language-server";

export async function CareerHero() {
  const t = await getTranslation();
  return (
    <Section padding="hero" testId="career-home">
      <Container className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-[720px] flex-col gap-5">
          <p className="text-accent-foreground text-sm font-medium">
            {t("Careers in Ethiopia")}
          </p>
          <h1 className="flex flex-col text-[34px] leading-[42px] font-medium tracking-tight text-balance md:text-[52px] md:leading-[56px]">
            <span>{t("Find your next role.")}</span>
            <span className="text-muted-foreground">
              {t("Get ready for it.")}
            </span>
          </h1>
          <p className="text-muted-foreground max-w-[520px] text-base leading-relaxed">
            {t(
              "Browse jobs in Ethiopia and learn how to write a stronger CV, prepare for interviews, and apply with confidence."
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="h-11 px-4 text-sm">
              <Link href={BOARD_HOME_PATH}>
                <Briefcase aria-hidden="true" /> {t("Browse jobs")}
              </Link>
            </Button>
            <Button asChild className="h-11 px-4 text-sm" variant="outline">
              <Link href="/blog">
                <BookOpen aria-hidden="true" /> {t("Read career guides")}
              </Link>
            </Button>
            <Button asChild className="h-11 px-4 text-sm" variant="outline">
              <Link href="/courses">
                <GraduationCap aria-hidden="true" /> {t("Courses")}
              </Link>
            </Button>
          </div>
        </div>
        <Image
          alt="Human Capital Solutions"
          className="bg-logo-background border-line size-36 shrink-0 rounded-xl border object-contain p-3 md:size-52"
          height={208}
          src={eteneshBrand.logo}
          unoptimized
          width={208}
        />
      </Container>
    </Section>
  );
}
