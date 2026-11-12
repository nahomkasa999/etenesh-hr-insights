import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

import { BRAND } from "./brand";
import { KBD_ON_OUTLINE, KBD_ON_PRIMARY, Kbd } from "./kbd";
import { MarketingHotkeys } from "./marketing-hotkeys";
import { MarketingImage } from "./marketing-image";
import { MarketingNavLinks } from "./marketing-nav-links";
import { MARKETING_HEADER_LINKS } from "./nav-links";

export function MarketingLogo() {
  return (
    <Link className="flex h-6 items-center gap-2 rounded-sm" href="/">
      <MarketingImage
        alt=""
        className="ring-line size-6 rounded-[6px] bg-white object-contain ring-1"
        height={24}
        src={BRAND.logo}
        width={24}
      />
      <span className="text-foreground text-[14px] leading-5 font-medium tracking-[-0.01em]">
        {BRAND.name}
      </span>
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

export function MarketingHeader() {
  return (
    <header
      className="bg-background border-line sticky top-0 z-50 border-b"
      data-testid="marketing-header"
    >
      <MarketingHotkeys />
      <div className="border-line mx-auto flex h-[55px] w-full max-w-[1200px] items-center justify-between px-4 min-[1200px]:border-x md:h-[52px] md:px-5">
        <div className="flex items-center gap-8">
          <MarketingLogo />
          <nav aria-label="Primary" className="hidden lg:block">
            <MarketingNavLinks items={MARKETING_HEADER_LINKS} />
          </nav>
        </div>
        <div className="flex items-center gap-2 lg:gap-1.5">
          <ThemeToggle className="size-9 lg:size-[30px]" />
          <Button
            asChild
            className="hidden h-[30px] gap-[7px] rounded-lg px-2.5 shadow-xs lg:inline-flex"
            variant="outline"
          >
            <a href={BRAND.signInUrl}>
              Sign in
              <Kbd className={KBD_ON_OUTLINE}>S</Kbd>
            </a>
          </Button>
          <Button
            asChild
            className="h-9 gap-[7px] rounded-lg px-3.5 text-[14px] lg:h-[30px] lg:px-2.5 lg:text-[13px]"
          >
            <a href={BRAND.jobsUrl}>
              Find a job
              <Kbd className={KBD_ON_PRIMARY}>J</Kbd>
            </a>
          </Button>
          <details className="relative lg:hidden">
            <summary className="bg-card ring-line-strong text-foreground flex size-9 cursor-pointer items-center justify-center rounded-lg ring-1">
              <MenuIcon />
              <span className="sr-only">Menu</span>
            </summary>
            <div className="bg-card ring-line-strong absolute right-0 mt-2 w-64 rounded-xl p-4 shadow-lg ring-1">
              <nav aria-label="Mobile">
                {/* A full load closes this disclosure. Client navigation leaves it open. */}
                <MarketingNavLinks items={MARKETING_HEADER_LINKS} native />
              </nav>
              <div className="border-line mt-3 flex flex-col gap-2 border-t pt-4">
                <Button asChild className="h-10 w-full" variant="outline">
                  <Link href={BRAND.coursesUrl}>Courses</Link>
                </Button>
                <Button asChild className="h-10 w-full" variant="outline">
                  <a href={BRAND.signInUrl}>Sign in</a>
                </Button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
