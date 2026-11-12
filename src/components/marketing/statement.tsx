import { Container } from "./container";
import { Section } from "./section";

// One sentence for what Etenesh does for the people applying.
const parts = [
  { highlight: false, text: "Etenesh" },
  { highlight: true, text: "lists" },
  {
    highlight: false,
    text: "real jobs, checks each application against what the employer",
  },
  { highlight: true, text: "asked for," },
  { highlight: false, text: "and" },
  { highlight: true, text: "updates" },
  { highlight: false, text: "you on Telegram at every step." },
] as const;

export function Statement() {
  return (
    <Section className="hidden md:block md:py-14">
      <Container>
        <p className="text-subtle max-w-[760px] text-[22px] leading-[34px] font-medium tracking-[-0.025em] [word-spacing:1px] md:text-[28px] md:leading-[38px]">
          {parts.map((part, index) => (
            <span key={part.text}>
              {index > 0 ? " " : null}
              {part.highlight || index === 0 ? (
                <span
                  className={
                    part.highlight
                      ? "bg-tag text-foreground rounded-[7px] box-decoration-clone px-[7px]"
                      : "text-foreground"
                  }
                >
                  {part.text}
                </span>
              ) : (
                part.text
              )}
            </span>
          ))}
        </p>
      </Container>
    </Section>
  );
}
