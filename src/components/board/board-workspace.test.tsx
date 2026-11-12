// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { htmlToLexical } from "@/lib/bordfeed/html-to-lexical";
import type { JobListItem } from "@/lib/read/types";

import { BoardWorkspace } from "./board-workspace";
import { JobRow } from "./job-row";

const NOW = Date.parse("2026-10-23T12:00:00Z");

function job(slug: string, title: string): JobListItem {
  return {
    applyHref: "https://example.com/apply",
    careerLevel: [],
    categories: [],
    companyLogoUrl: null,
    companyName: "Acme",
    companySlug: null,
    countryCode: null,
    employmentType: "full-time",
    featured: false,
    id: slug,
    indexable: true,
    languages: [],
    locationDisplay: null,
    origin: "manual",
    publishedAt: null,
    remoteRegion: null,
    salaryCurrency: "USD",
    salaryMax: 190_000,
    salaryMaxUsd: 190_000,
    salaryMin: 150_000,
    salaryMinUsd: 150_000,
    seniority: "senior",
    slug,
    title,
    validThrough: null,
    visaSponsorship: null,
    workplaceType: "remote",
  };
}

const JOBS = [job("a-role", "Role A"), job("b-role", "Role B")];

let wide = true;

beforeEach(() => {
  wide = true;
  window.localStorage.clear();
  vi.stubGlobal("matchMedia", (query: string) => ({
    addEventListener: () => undefined,
    matches: wide,
    media: query,
    removeEventListener: () => undefined,
  }));
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(Response.json({ items: [] })))
  );
  Element.prototype.scrollIntoView = () => undefined;
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderBoard() {
  render(
    <BoardWorkspace
      className="grid"
      jobs={JOBS}
      list={
        <ul>
          {JOBS.map((item) => (
            <JobRow job={item} key={item.id} now={NOW} />
          ))}
        </ul>
      }
      now={NOW}
      openClassName="open"
      total={2}
    />
  );
}

test("a plain click previews the job instead of navigating", () => {
  renderBoard();
  const [link] = screen.getAllByTestId("job-row-link");
  const click = new MouseEvent("click", { bubbles: true, cancelable: true });
  act(() => {
    link?.dispatchEvent(click);
  });

  expect(click.defaultPrevented).toBe(true);
  const preview = screen.getByTestId("job-preview");
  expect(preview.textContent).toContain("Role A");
  expect(within(preview).getByText("$150k-190k")).toBeTruthy();
  expect(within(preview).getByText("Senior")).toBeTruthy();
  expect(screen.getByTestId("job-preview-apply").getAttribute("href")).toBe(
    "https://example.com/apply"
  );
  expect(
    screen.getAllByTestId("job-row")[0]?.getAttribute("data-selected")
  ).toBe("true");
});

test("the preview shows full details and opens the application in place", async () => {
  const manual = {
    ...job("civil-engineer", "Civil Engineer"),
    applyHref: null,
  };
  const description = htmlToLexical(
    "<p>Design and supervise roads and bridges.</p><h3>Requirements</h3><p>Five years of construction experience.</p>"
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(Response.json({ description })))
  );
  render(
    <BoardWorkspace
      className="grid"
      jobs={[manual]}
      list={
        <ul>
          <JobRow job={manual} now={NOW} />
        </ul>
      }
      now={NOW}
      openClassName="open"
      total={1}
    />
  );

  fireEvent.click(screen.getByTestId("job-row-link"));
  const preview = screen.getByTestId("job-preview");
  expect(await within(preview).findByText("Requirements")).toBeTruthy();
  expect(
    within(preview).getByText("Five years of construction experience.")
  ).toBeTruthy();
  expect(within(preview).queryByText("Open full post ↗")).toBeNull();
  expect(within(preview).queryByText("Read the full post")).toBeNull();

  fireEvent.click(within(preview).getByRole("button", { name: "Apply now" }));
  expect(screen.getByTestId("job-preview-apply-section")).toBeTruthy();
  expect(screen.getByTestId("job-preview-form-pane")).toBeTruthy();
  expect(screen.queryByTestId("job-preview-details")).toBeNull();
  expect(
    within(preview).getByRole("button", { name: "Close form" })
  ).toBeTruthy();
  fireEvent.click(within(preview).getByRole("button", { name: "Close form" }));
  expect(screen.getByTestId("job-preview-details")).toBeTruthy();
  expect(screen.queryByTestId("job-preview-form-pane")).toBeNull();
});

test("only the top bar and footer wheel gestures switch jobs", () => {
  renderBoard();
  const [first] = screen.getAllByTestId("job-row-link");
  fireEvent.click(first as HTMLElement);

  const preview = screen.getByTestId("job-preview");
  expect(
    within(preview).queryByRole("button", { name: "Next job (J)" })
  ).toBeNull();
  const details = screen.getByTestId("job-preview-details");
  Object.defineProperties(details, {
    clientHeight: { value: 500 },
    scrollHeight: { value: 1000 },
  });
  details.scrollTop = 100;
  fireEvent.wheel(details, { deltaY: 120 });
  expect(screen.getByTestId("job-preview").textContent).toContain("Role A");

  details.scrollTop = 500;
  fireEvent.wheel(details, { deltaY: 120 });
  expect(screen.getByTestId("job-preview").textContent).toContain("Role A");

  fireEvent.wheel(screen.getByTestId("job-preview-topbar"), { deltaY: 120 });

  expect(screen.getByTestId("job-preview").textContent).toContain("Role B");
});

test("Cmd-click and narrow screens keep the real link", () => {
  renderBoard();
  const [link] = screen.getAllByTestId("job-row-link");
  const cmd = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    metaKey: true,
  });
  link?.dispatchEvent(cmd);
  expect(cmd.defaultPrevented).toBe(false);

  wide = false;
  const narrow = new MouseEvent("click", { bubbles: true, cancelable: true });
  link?.dispatchEvent(narrow);
  expect(narrow.defaultPrevented).toBe(false);
  expect(screen.queryByTestId("job-preview")).toBeNull();
});

test("J moves the preview, S saves and Escape closes", () => {
  renderBoard();
  const [link] = screen.getAllByTestId("job-row-link");
  fireEvent.click(link as HTMLElement);

  fireEvent.keyDown(document, { key: "j" });
  expect(screen.getByTestId("job-preview").textContent).toContain("Role B");

  fireEvent.keyDown(document, { key: "s" });
  expect(window.localStorage.getItem("bordful:saved-jobs")).toContain("b-role");

  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByTestId("job-preview")).toBeNull();
});
