export function isMarketingEnabled(
  env: Partial<NodeJS.ProcessEnv> = process.env
): boolean {
  // Etenesh always shows its landing page at / unless it is turned off.
  return env.BORDFUL_MARKETING !== "false";
}
