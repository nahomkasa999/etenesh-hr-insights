// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { MarketingHeader } from "./marketing-header";
import { MARKETING_HEADER_LINKS } from "./nav-links";

const SIGN_IN = /^Sign in/u;
const FIND_JOB = /^Find a job/u;
const GITHUB = /GitHub/u;

const MARKETING_HEADER_HREFS = MARKETING_HEADER_LINKS.map((link) => link.href);

afterEach(() => {
  cleanup();
});

test("marketing header nav links keep the old order", () => {
  render(<MarketingHeader />);

  const nav = screen.getByRole("navigation", { name: "Primary" });
  const hrefs = within(nav)
    .getAllByRole("link")
    .map((link) => link.getAttribute("href"));

  expect(hrefs).toEqual(MARKETING_HEADER_HREFS);
});

test("mobile nav links use the same hrefs", () => {
  render(<MarketingHeader />);

  const nav = screen.getByRole("navigation", { name: "Mobile" });
  const hrefs = within(nav)
    .getAllByRole("link")
    .map((link) => link.getAttribute("href"));

  expect(hrefs).toEqual(MARKETING_HEADER_HREFS);
});

test("header has Sign in to the admin and Find a job to the board", () => {
  render(<MarketingHeader />);

  const signIn = screen.getAllByRole("link", { name: SIGN_IN });
  expect(signIn.length).toBeGreaterThan(0);
  for (const link of signIn) {
    expect(link.getAttribute("href")).toBe("/admin");
  }

  const find = screen.getByRole("link", { name: FIND_JOB });
  expect(find.getAttribute("href")).toBe("/jobs");
});

test("header no longer shows the GitHub or Deploy buttons", () => {
  render(<MarketingHeader />);

  expect(screen.queryAllByRole("link", { name: GITHUB })).toHaveLength(0);
  expect(screen.queryAllByRole("link", { name: "Deploy" })).toHaveLength(0);
});
