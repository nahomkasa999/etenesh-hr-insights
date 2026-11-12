import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { eteneshBrand } from "./brand";
import { getTranslation } from "./language-server";

export async function CareerHero() {
  const t = await getTranslation();
  return (
    <section aria-labelledby="career-heading" className="career-hero">
      <div className="career-hero-inner">
        <div className="career-hero-copy">
          <p className="career-eyebrow">{t("Careers in Ethiopia")}</p>
          <h1 id="career-heading">
            {t("Find your next role.")}
            <br />
            {t("Get ready for it.")}
          </h1>
          <p>
            {t(
              "Browse jobs in Ethiopia and learn how to write a stronger CV, prepare for interviews, and apply with confidence."
            )}
          </p>
          <div className="career-hero-actions">
            <Link href="/blog">
              <BookOpen aria-hidden="true" size={17} />{" "}
              {t("Read career guides")}
            </Link>
          </div>
        </div>
        <div className="career-brand-card">
          <Image
            alt="Human Capital Solutions"
            height={180}
            src={eteneshBrand.logo}
            unoptimized
            width={180}
          />
          <p>Human Capital Solutions</p>
          <span className="text-muted-foreground mt-1 text-xs">
            Pitch preview
          </span>
        </div>
      </div>
    </section>
  );
}
