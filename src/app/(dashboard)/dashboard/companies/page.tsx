import type { Metadata } from "next";
import Link from "next/link";

import { CompanyDialog } from "@/components/dashboard/company-dialog";
import { SiteHeader } from "@/components/dashboard/site-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCompanies, requireStaff } from "@/lib/etenesh/dashboard-data";

export const metadata: Metadata = { title: "Companies" };

export default async function CompaniesPage() {
  const { payload } = await requireStaff("/dashboard/companies");
  const companies = await listCompanies(payload);
  return (
    <>
      <SiteHeader actions={<CompanyDialog />} title="Companies" />
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="h-11 text-sm">Company</TableHead>
                <TableHead className="h-11 text-sm">Industry</TableHead>
                <TableHead className="h-11 text-sm">Location</TableHead>
                <TableHead className="h-11 text-right text-sm">Jobs</TableHead>
                <TableHead className="h-11 w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="text-muted-foreground h-24 text-center"
                    colSpan={5}
                  >
                    No companies yet.
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="py-3 text-[15px] font-medium">
                      {company.website ? (
                        <Link
                          className="hover:underline"
                          href={company.website}
                          rel="noopener"
                          target="_blank"
                        >
                          {company.name}
                        </Link>
                      ) : (
                        company.name
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {company.industry || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {company.location || "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {company.jobs}
                    </TableCell>
                    <TableCell>
                      <CompanyDialog company={company} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
