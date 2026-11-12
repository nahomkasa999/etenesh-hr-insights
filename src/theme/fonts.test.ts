import { expect, test, vi } from "vitest";

// next/font is a build-time transform; record the options each face gets.
const calls = vi.hoisted(() => new Map<string, { preload?: boolean }>());

vi.mock("next/font/google", () => {
  const face =
    (name: string) => (options: { preload?: boolean; variable: string }) => {
      calls.set(name, options);
      return { className: name, variable: options.variable };
    };
  return {
    JetBrains_Mono: face("JetBrains_Mono"),
    Lora: face("Lora"),
    Plus_Jakarta_Sans: face("Plus_Jakarta_Sans"),
  };
});

test("only the default body face is preloaded", async () => {
  await import("./fonts");

  expect(calls.get("Plus_Jakarta_Sans")?.preload).not.toBe(false);
  expect(calls.get("JetBrains_Mono")?.preload).toBe(false);
  expect(calls.get("Lora")?.preload).toBe(false);
});
