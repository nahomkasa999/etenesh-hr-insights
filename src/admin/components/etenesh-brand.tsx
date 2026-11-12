import type { ReactNode } from "react";

import { geistMono, geistSans } from "@/theme/fonts";

const MARK = "/etenesh/mark.png";

// Login page logo: the Etenesh mark, the name and one line on what the
// admin is for.
export function EteneshLogo() {
  return (
    <div className="et-login-brand">
      {/* biome-ignore lint/performance/noImgElement: a static 48px mark */}
      <img alt="" className="et-login-mark" height={48} src={MARK} width={48} />
      <p className="et-login-name">Etenesh HR</p>
      <p className="et-login-lead">
        Sign in to post jobs and review applicants.
      </p>
    </div>
  );
}

// The small mark Payload shows in the admin chrome.
export function EteneshIcon() {
  return (
    // biome-ignore lint/performance/noImgElement: a static 24px mark
    <img
      alt="Etenesh HR"
      className="et-icon"
      height={24}
      src={MARK}
      width={24}
    />
  );
}

// Top of the side menu: the brand, and a way back to the public site.
export function EteneshNavBrand() {
  return (
    <div className="et-nav-brand">
      <a className="et-nav-brand-link" href="/admin">
        {/* biome-ignore lint/performance/noImgElement: a static 24px mark */}
        <img alt="" className="et-icon" height={24} src={MARK} width={24} />
        <span>Etenesh HR</span>
      </a>
      <a className="et-nav-site" href="/" rel="noopener" target="_blank">
        View site ↗
      </a>
    </div>
  );
}

// Loads the board's Geist faces into the admin so both read the same.
export function EteneshFonts({ children }: { children?: ReactNode }) {
  const css = `:root{--font-body:${geistSans.style.fontFamily};--font-mono:${geistMono.style.fontFamily};}`;
  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static font tokens */}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </>
  );
}
