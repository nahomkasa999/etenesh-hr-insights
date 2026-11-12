import { describe, expect, it } from "vitest";

import {
  canContinue,
  describeRequirements,
  formatFileSize,
  missedRequirements,
} from "@/components/apply/eligibility";

const req = { education: "Bachelor's degree", minYearsExperience: 2 };

describe("eligibility", () => {
  it("describes requirements", () => {
    expect(describeRequirements(req)).toBe(
      "Needs 2+ years of experience and a Bachelor's degree."
    );
    expect(
      describeRequirements({ education: "None", minYearsExperience: 0 })
    ).toContain("No special");
  });

  it("lists what is missed", () => {
    const missed = missedRequirements(req, {
      education: "Diploma",
      yearsExperience: "1",
    });
    expect(missed).toHaveLength(2);
    expect(missed[0]).toContain("at least 2 years");
    expect(missed[1]).toContain("Bachelor's degree or higher");
  });

  it("allows eligible people and blocks others", () => {
    expect(
      canContinue(req, { education: "Master's degree", yearsExperience: "2" })
    ).toBe(true);
    expect(
      canContinue(req, { education: "Bachelor's degree", yearsExperience: "1" })
    ).toBe(false);
    expect(canContinue(req, { education: "", yearsExperience: "" })).toBe(
      false
    );
  });

  it("formats sizes", () => {
    expect(formatFileSize(2048)).toBe("2 KB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});
