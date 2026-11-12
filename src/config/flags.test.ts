import { expect, test } from "vitest";

import { isMarketingEnabled } from "./flags";

test("the landing page is on unless set to the exact string false", () => {
  for (const value of ["true", "1", "", undefined]) {
    expect(isMarketingEnabled({ BORDFUL_MARKETING: value })).toBe(true);
  }

  expect(isMarketingEnabled({ BORDFUL_MARKETING: "false" })).toBe(false);
});
