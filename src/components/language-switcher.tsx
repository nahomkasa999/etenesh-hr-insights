"use client";

import { LOCALE_COOKIE, type Locale } from "@/lib/locale";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <div
      aria-label={locale === "am" ? "ቋንቋ" : "Language"}
      className="language-switcher"
      role="group"
    >
      <button
        aria-pressed={locale === "en"}
        lang="en"
        onClick={() => setLocale("en")}
        type="button"
      >
        EN
      </button>
      <span aria-hidden="true">/</span>
      <button
        aria-pressed={locale === "am"}
        lang="am"
        onClick={() => setLocale("am")}
        type="button"
      >
        አማ
      </button>
    </div>
  );
}
