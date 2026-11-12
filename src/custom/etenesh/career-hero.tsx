import { ArrowDown, ArrowUpRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { eteneshBrand, eteneshSocial } from "./brand";

export function CareerHero() {
  return (
    <section aria-labelledby="career-heading" className="career-hero">
      <div className="career-hero-inner">
        <div className="career-hero-copy">
          <p className="career-eyebrow">Careers in Ethiopia</p>
          <h1 id="career-heading">
            Find your next role.
            <br />
            Get ready for it.
          </h1>
          <p>
            Browse jobs in Ethiopia and learn how to write a stronger CV,
            prepare for interviews, and apply with confidence.
          </p>
          <div className="career-hero-actions">
            <Link href="#latest-jobs">
              Browse jobs <ArrowDown aria-hidden="true" size={17} />
            </Link>
            <Link href="/blog">
              <BookOpen aria-hidden="true" size={17} /> Read career guides
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
          <a
            href={eteneshSocial.tiktok}
            rel="noopener noreferrer"
            target="_blank"
          >
            Etenesh on TikTok <ArrowUpRight aria-hidden="true" size={14} />
          </a>
          <span className="mt-1 text-xs text-slate-600">Pitch preview</span>
        </div>
      </div>
    </section>
  );
}
