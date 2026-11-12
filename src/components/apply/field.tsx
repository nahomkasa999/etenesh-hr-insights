import { AlertCircle } from "lucide-react";

import { Label } from "@/components/ui/label";

// Every size here is text-sm (14px) or larger on purpose.
export const INPUT_CLASS = "h-11 text-base md:text-sm";
export const LABEL_CLASS = "text-sm leading-5";
export const BUTTON_CLASS = "h-11 text-sm px-5";

export function Field({
  children,
  error,
  hint,
  htmlFor,
  label,
  optional,
}: {
  children: React.ReactNode;
  error?: string;
  hint?: string;
  htmlFor: string;
  label: string;
  optional?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-2"
      data-field-error={error ? "1" : undefined}
    >
      <Label className={LABEL_CLASS} htmlFor={htmlFor}>
        {label}
        {optional ? (
          <span className="text-muted-foreground font-normal">(optional)</span>
        ) : null}
      </Label>
      {hint ? (
        <p
          className="text-muted-foreground text-sm leading-5"
          id={`${htmlFor}-hint`}
        >
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p
          className="text-destructive flex items-start gap-1.5 text-sm leading-5"
          id={`${htmlFor}-error`}
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
