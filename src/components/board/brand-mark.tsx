import { BriefcaseBusiness } from "lucide-react";

const BORDFUL_MARK_SRC = "/etenesh/logo.webp";

// Shown when Site settings has no logo, so a fresh board still has a mark.
// bordful.com (marketing mode) shows the Bordful mark, as Paper draws it.
export function BrandMark({ bordful = false }: { bordful?: boolean }) {
  if (bordful) {
    return (
      // biome-ignore lint/performance/noImgElement: a 20px static mark
      <img
        alt=""
        className="h-5 w-auto shrink-0 object-contain"
        data-testid="bordful-mark"
        height={20}
        src={BORDFUL_MARK_SRC}
        width={24}
      />
    );
  }

  return (
    <span className="bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded-[5px]">
      <BriefcaseBusiness aria-hidden="true" className="size-3" />
    </span>
  );
}
