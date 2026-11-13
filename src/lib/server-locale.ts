import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale, normalizeLocale } from "./locale";

export async function getLocale(): Promise<Locale> {
  return normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}
