"use server";

import { cookies } from "next/headers";

import { isLanguage, languageCookie } from "./language";

export async function setLanguage(formData: FormData) {
  const language = formData.get("language");
  if (isLanguage(language)) {
    (await cookies()).set(languageCookie, language, {
      httpOnly: true,
      maxAge: 31_536_000,
      path: "/",
      sameSite: "lax",
    });
  }
}
