import { redirect } from "next/navigation";

// The HR team works in the dashboard at /dashboard. Payload's own home page
// sends them there; the rest of the admin stays for editing jobs.
export function EteneshDashboard(): never {
  redirect("/dashboard");
}
