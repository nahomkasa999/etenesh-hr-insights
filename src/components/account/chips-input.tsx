"use client";

import { Plus, X } from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useState,
} from "react";

import { cn } from "@/lib/utils";

const SPLIT_RE = /[,\n]/u;

function merge(value: string[], raw: string, max: number): string[] {
  const next = [...value];
  for (const item of raw.split(SPLIT_RE)) {
    const clean = item.trim();
    if (
      clean.length > 0 &&
      clean.length <= 80 &&
      next.length < max &&
      !next.some((existing) => existing.toLowerCase() === clean.toLowerCase())
    ) {
      next.push(clean);
    }
  }
  return next;
}

// A list of short values (skills, places). Enter or a comma adds; suggestions
// add with a tap. Calls onChange(name, next) so one handler serves a form.
export function ChipsInput({
  id,
  max = 40,
  name,
  onChange,
  placeholder,
  suggestions = [],
  value,
}: {
  id: string;
  max?: number;
  name: string;
  onChange: (name: string, next: string[]) => void;
  placeholder: string;
  suggestions?: readonly string[];
  value: string[];
}) {
  const [draft, setDraft] = useState("");

  const add = useCallback(
    (raw: string) => {
      onChange(name, merge(value, raw, max));
      setDraft("");
    },
    [max, name, onChange, value]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        add(draft);
      } else if (
        event.key === "Backspace" &&
        draft === "" &&
        value.length > 0
      ) {
        onChange(name, value.slice(0, -1));
      }
    },
    [add, draft, name, onChange, value]
  );

  const onDraft = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value),
    []
  );
  const onBlur = useCallback(() => {
    if (draft.trim()) {
      add(draft);
    }
  }, [add, draft]);
  const onRemove = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const item = event.currentTarget.dataset.value;
      onChange(
        name,
        value.filter((other) => other !== item)
      );
    },
    [name, onChange, value]
  );
  const onSuggest = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      add(event.currentTarget.dataset.value ?? ""),
    [add]
  );

  const open = suggestions
    .filter(
      (item) =>
        !value.some((existing) => existing.toLowerCase() === item.toLowerCase())
    )
    .slice(0, 12);

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-card ring-line-strong focus-within:ring-ring/60 flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg px-2 py-1.5 ring-1 ring-inset focus-within:ring-2">
        {value.map((item) => (
          <span
            className="bg-tag text-foreground inline-flex h-7 items-center gap-1 rounded-md pr-1 pl-2 text-[13px]"
            key={item}
          >
            {item}
            <button
              aria-label={`Remove ${item}`}
              className="text-muted-foreground hover:text-foreground flex size-5 items-center justify-center rounded"
              data-value={item}
              onClick={onRemove}
              type="button"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          className="text-foreground placeholder:text-subtle h-8 min-w-32 flex-1 bg-transparent px-1 text-base outline-none md:text-sm"
          data-no-ring
          id={id}
          onBlur={onBlur}
          onChange={onDraft}
          onKeyDown={onKeyDown}
          placeholder={value.length === 0 ? placeholder : "Add more"}
          value={draft}
        />
      </div>
      {open.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {open.map((item) => (
            <button
              className="text-muted-foreground hover:text-foreground ring-line hover:ring-line-strong inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] ring-1 ring-inset"
              data-value={item}
              key={item}
              onClick={onSuggest}
              type="button"
            >
              <Plus aria-hidden="true" className="size-3" />
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// Pick any number from a fixed list.
export function ToggleChips<T extends string>({
  label,
  name,
  onChange,
  options,
  value,
}: {
  label: string;
  name: string;
  onChange: (name: string, next: T[]) => void;
  options: readonly { label: string; value: T }[];
  value: T[];
}) {
  const onToggle = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const picked = event.currentTarget.value as T;
      onChange(
        name,
        value.includes(picked)
          ? value.filter((item) => item !== picked)
          : [...value, picked]
      );
    },
    [name, onChange, value]
  );
  return (
    <fieldset aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const on = value.includes(option.value);
        return (
          <button
            aria-pressed={on}
            className={cn(
              "inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium ring-1 ring-inset",
              on
                ? "bg-primary text-primary-foreground ring-primary"
                : "text-muted-foreground ring-line-strong hover:text-foreground"
            )}
            key={option.value}
            onClick={onToggle}
            type="button"
            value={option.value}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
