"use client";

import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { saveCompany } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompanyRow } from "@/lib/etenesh/dashboard-data";

const FIELDS = [
  { key: "name", label: "Company name" },
  { key: "industry", label: "Industry" },
  { key: "location", label: "Location" },
  { key: "website", label: "Website (https://…)" },
] as const;

export function CompanyDialog({ company }: { company?: CompanyRow }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState({
    industry: company?.industry ?? "",
    location: company?.location ?? "",
    name: company?.name ?? "",
    website: company?.website ?? "",
  });
  const [pending, startTransition] = React.useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveCompany(company?.id ?? null, values);
      if (result.ok) {
        toast.success("Company saved");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not save the company.");
      }
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {company ? (
          <Button
            aria-label={`Edit ${company.name}`}
            size="icon"
            variant="ghost"
          >
            <IconPencil />
          </Button>
        ) : (
          <Button className="h-9">
            <IconPlus />
            Add company
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              {company ? "Edit company" : "Add a company"}
            </DialogTitle>
            <DialogDescription>
              Jobs you post pick the company from this list.
            </DialogDescription>
          </DialogHeader>
          {FIELDS.map(({ key, label }) => (
            <div className="flex flex-col gap-1.5" key={key}>
              <Label className="text-[15px]" htmlFor={`company-${key}`}>
                {label}
              </Label>
              <Input
                className="h-10 text-[15px]"
                id={`company-${key}`}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                required={key === "name"}
                value={values[key]}
              />
            </div>
          ))}
          <DialogFooter>
            <Button disabled={pending} type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
