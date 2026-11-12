"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import {
  addApplicationNote,
  updateApplicationStatus,
} from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type ApplicationStatus,
  STATUS_ACTIONS,
  STATUS_LABELS,
  STATUS_MESSAGES,
} from "@/lib/etenesh/vocab";

// One big button per next step. Rejecting asks first.
export function StatusActions({
  id,
  name,
  status,
}: {
  id: number;
  name: string;
  status: ApplicationStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const actions = STATUS_ACTIONS[status];

  function move(to: ApplicationStatus) {
    startTransition(async () => {
      const result = await updateApplicationStatus(id, to);
      if (result.ok) {
        toast.success(`${name} moved to ${STATUS_LABELS[to]}`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not save the change.");
      }
    });
  }

  if (actions.length === 0) {
    return (
      <p className="text-muted-foreground text-[15px]">
        This application is complete. Nothing more to do.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {actions.map((action) =>
        action.to === "rejected" ? (
          <Dialog key={action.to}>
            <DialogTrigger asChild>
              <Button
                className="h-11 justify-start text-[15px]"
                disabled={pending}
                variant="outline"
              >
                <IconX className="text-destructive" />
                {action.label}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject {name}?</DialogTitle>
                <DialogDescription className="text-[15px]">
                  They will see: “{STATUS_MESSAGES.rejected}” You can reopen the
                  application later.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="h-10" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    className="h-10"
                    onClick={() => move("rejected")}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            className="h-11 justify-start text-[15px]"
            disabled={pending}
            key={action.to}
            onClick={() => move(action.to)}
            variant={action === actions[0] ? "default" : "outline"}
          >
            <IconCheck />
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}

export function NoteForm({ id }: { id: number }) {
  const router = useRouter();
  const [text, setText] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await addApplicationNote(id, text);
      if (result.ok) {
        setText("");
        toast.success("Note saved");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not save the note.");
      }
    });
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={submit}>
      <Label className="text-[15px]" htmlFor="note">
        Add a note for the team
      </Label>
      <Textarea
        className="min-h-24 text-[15px]"
        id="note"
        onChange={(event) => setText(event.target.value)}
        placeholder="For example: strong answers, call on Monday."
        value={text}
      />
      <Button
        className="h-10 self-start"
        disabled={pending || text.trim() === ""}
        type="submit"
      >
        Save note
      </Button>
    </form>
  );
}
