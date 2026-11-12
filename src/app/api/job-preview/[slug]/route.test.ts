import { expect, test, vi } from "vitest";

import { getJobBySlug } from "@/lib/read";

import { GET } from "./route";

vi.mock("@/lib/read", () => ({ getJobBySlug: vi.fn() }));

test("returns the selected job's complete description", async () => {
  const description = { root: { children: [{ text: "Full description" }] } };
  vi.mocked(getJobBySlug).mockResolvedValue({ description } as never);

  const response = await GET(new Request("http://localhost"), {
    params: Promise.resolve({ slug: "civil-engineer" }),
  });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ description });
  expect(getJobBySlug).toHaveBeenCalledWith("civil-engineer");
});

test("rejects an invalid job slug", async () => {
  const response = await GET(new Request("http://localhost"), {
    params: Promise.resolve({ slug: "../../secret" }),
  });

  expect(response.status).toBe(404);
  expect(getJobBySlug).not.toHaveBeenCalledWith("../../secret");
});
