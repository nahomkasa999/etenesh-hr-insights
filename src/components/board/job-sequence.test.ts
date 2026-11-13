import { expect, test } from "vitest";

import { jobNeighbors } from "./job-sequence";

const list = ["a", "b", "c"].map((slug) => ({
  slug,
  title: slug.toUpperCase(),
}));

test("finds the next and previous job in the saved list", () => {
  expect(jobNeighbors("b", list, [])).toEqual({
    index: 1,
    next: list[2],
    prev: list[0],
    total: 3,
  });
  expect(jobNeighbors("a", list, [])?.prev).toBeNull();
  expect(jobNeighbors("c", list, [])?.next).toBeNull();
});

test("falls back to similar jobs when the job is not in the saved list", () => {
  const fallback = [
    { slug: "x", title: "X" },
    { slug: "y", title: "Y" },
  ];
  expect(jobNeighbors("x", list, fallback)).toMatchObject({
    index: 0,
    next: fallback[1],
    prev: null,
  });
});

test("has no neighbours for a lone job", () => {
  expect(jobNeighbors("z", list, [{ slug: "z", title: "Z" }])).toBeNull();
  expect(jobNeighbors("z", [], [])).toBeNull();
});
