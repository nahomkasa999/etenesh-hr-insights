import { cookies } from "next/headers";
import { cache } from "react";

import { isLanguage, languageCookie, translate } from "./language";

export const getLanguage = cache(async () => {
  const language = (await cookies()).get(languageCookie)?.value;
  return isLanguage(language) ? language : "en";
});

export async function getTranslation() {
  const language = await getLanguage();
  return (text: string) => translate(language, text);
}
