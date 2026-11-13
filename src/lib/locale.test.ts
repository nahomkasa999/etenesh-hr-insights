import { expect, test } from "vitest";
import { normalizeLocale, translate } from "./locale";

test("only supported locale values select Amharic", () => {
  expect(normalizeLocale("am")).toBe("am");
  expect(normalizeLocale("en")).toBe("en");
  expect(normalizeLocale("fr")).toBe("en");
  expect(normalizeLocale(undefined)).toBe("en");
});

test("navigation and hero copy translate while unknown content stays authored", () => {
  expect(translate("am", "Browse jobs")).toBe("ስራዎችን ይመልከቱ");
  expect(translate("am", "Find work that fits you.")).toBe(
    "ለእርስዎ የሚስማማ ስራ ያግኙ።"
  );
  expect(translate("am", "An employer supplied description")).toBe(
    "An employer supplied description"
  );
  expect(translate("en", "Browse jobs")).toBe("Browse jobs");
});
