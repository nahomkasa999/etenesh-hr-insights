"use client";

import { useEffect } from "react";

import { BRAND } from "./brand";

const HOTKEYS: Record<string, string> = {
  j: BRAND.jobsUrl,
  s: BRAND.signInUrl,
};

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

// J opens the job board and S the sign-in page, as the hints on the header
// and CTA buttons say. Keys typed into a field are left alone.
export function MarketingHotkeys() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        isTyping(event.target)
      ) {
        return;
      }

      const url = HOTKEYS[event.key.toLowerCase()];
      if (url) {
        event.preventDefault();
        window.location.assign(url);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
