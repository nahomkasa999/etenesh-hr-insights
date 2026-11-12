// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { Bento } from "./bento";
import { FinalCta } from "./final-cta";
import { TechStack } from "./tech-stack";

afterEach(() => {
  cleanup();
});

const BROWSE_JOBS = /^Browse jobs/u;
const SEE_COURSES = /^See courses/u;
const NEXT_JOB = /Your next job is waiting/u;

const TITLES = [
  "Made for your phone",
  "Clear, honest listings",
  "Updates on Telegram",
  "Employers get the right people",
];

const SECTORS = [
  "Banking",
  "NGOs",
  "Health",
  "IT & Software",
  "Hospitality",
  "Manufacturing",
  "Logistics",
  "Education",
];

test("bento renders each card for phones and for desktop", () => {
  render(<Bento />);

  for (const title of TITLES) {
    expect(screen.getAllByRole("heading", { name: title })).toHaveLength(2);
  }
});

test("bento is the employers section and shows the Telegram preview", () => {
  const { container } = render(<Bento />);

  expect(container.querySelector("#employers")).not.toBeNull();
  expect(container.querySelector("pre")).toBeNull();
  expect(
    screen.getByRole("img", {
      name: "Example Telegram updates from the Etenesh bot",
    })
  ).toBeTruthy();
  expect(screen.getByText("/status")).toBeTruthy();
});

test("tech stack lists the same eight sectors as chips and as a grid", () => {
  const { container } = render(<TechStack />);

  expect(screen.getAllByRole("list")).toHaveLength(2);
  for (const sector of SECTORS) {
    expect(screen.getAllByText(sector)).toHaveLength(2);
  }
  // Only the desktop grid carries a lucide icon per sector.
  expect(container.querySelectorAll("svg.lucide")).toHaveLength(8);
});

test("final CTA has a phone close and the desktop band", () => {
  render(<FinalCta />);

  const browse = screen.getAllByRole("link", { name: BROWSE_JOBS });
  expect(browse).toHaveLength(2);
  for (const link of browse) {
    expect(link.getAttribute("href")).toBe("/jobs");
  }

  const courses = screen.getAllByRole("link", { name: SEE_COURSES });
  expect(courses).toHaveLength(2);
  for (const link of courses) {
    expect(link.getAttribute("href")).toBe("/#courses");
  }
  expect(screen.getAllByRole("heading", { name: NEXT_JOB })).toHaveLength(2);
});
