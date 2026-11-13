// Only same-site paths, so a crafted link cannot send people elsewhere.
export function safeNext(value: string | null | undefined): string {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/account";
  }
  return value;
}
