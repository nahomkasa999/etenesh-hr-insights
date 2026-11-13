"use client";

import { IconChevronDown } from "@tabler/icons-react";
import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// A card whose body folds away. The header stays so the card is still
// readable closed.
export function CollapsibleCard({
  children,
  defaultOpen = true,
  description,
  summary,
  title,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description?: ReactNode;
  summary?: ReactNode;
  title: string;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <Card>
        <CardHeader>
          <CollapsibleTrigger className="group flex w-full items-start justify-between gap-3 text-left">
            <span className="flex flex-col gap-1.5">
              <CardTitle className="text-lg">{title}</CardTitle>
              {description ? (
                <CardDescription className="text-[15px]">
                  {description}
                </CardDescription>
              ) : null}
            </span>
            <span className="text-muted-foreground flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
              <span className="group-data-[state=open]:hidden">
                Show details
              </span>
              <span className="hidden group-data-[state=open]:inline">
                Hide
              </span>
              <IconChevronDown className="size-5 transition-transform group-data-[state=open]:rotate-180" />
            </span>
          </CollapsibleTrigger>
          {summary}
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="flex flex-col gap-5 text-[15px]">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
