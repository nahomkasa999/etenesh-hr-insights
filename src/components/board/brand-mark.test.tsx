// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { BrandMark } from "./brand-mark";

afterEach(() => {
  cleanup();
});

test("a fork without a logo gets the generic mark", () => {
  render(<BrandMark />);
  expect(screen.queryByTestId("bordful-mark")).toBeNull();
});

test("bordful.com gets the Etenesh mark on a white tile", () => {
  render(<BrandMark bordful />);
  const mark = screen.getByTestId("bordful-mark");
  expect(mark.getAttribute("src")).toBe("/etenesh/mark.png");
  expect(mark.className).toContain("bg-white");
  expect(mark.className).not.toContain("dark:invert");
});
