"use client";

import {
  type ChangeEvent,
  createContext,
  type ReactNode,
  useContext,
} from "react";

import { type Language, languages, translate } from "./language";
import { setLanguage } from "./set-language";

const LanguageContext = createContext<Language>("en");

export function LanguageProvider({
  children,
  language,
}: {
  children: ReactNode;
  language: Language;
}) {
  return (
    <LanguageContext.Provider value={language}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const language = useContext(LanguageContext);
  return (text: string) => translate(language, text);
}

function submitLanguage(event: ChangeEvent<HTMLSelectElement>) {
  event.currentTarget.form?.requestSubmit();
}

export function LanguageSelect({ className }: { className?: string }) {
  const language = useContext(LanguageContext);

  return (
    <form action={setLanguage} className={className}>
      <select
        aria-label={translate(language, "Language")}
        className="bg-card text-foreground h-full min-h-[inherit] w-full rounded-[inherit] px-2"
        defaultValue={language}
        key={language}
        name="language"
        onChange={submitLanguage}
      >
        {Object.entries(languages).map(([code, label]) => (
          <option key={code} lang={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
