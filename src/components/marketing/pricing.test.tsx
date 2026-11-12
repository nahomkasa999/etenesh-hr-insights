// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { Pricing } from "./pricing";

afterEach(() => {
  cleanup();
});

test("section pricing plan names are headings", () => {
  render(<Pricing />);

  expect(
    screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent)
  ).toEqual(["Write a CV that gets read", "Interview ready in one week"]);
});

test("standalone pricing plan names are headings", () => {
  render(<Pricing variant="standalone" />);

  expect(
    screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent)
  ).toEqual(["Write a CV that gets read", "Interview ready in one week"]);
});
