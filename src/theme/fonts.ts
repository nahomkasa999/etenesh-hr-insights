import { JetBrains_Mono, Lora, Plus_Jakarta_Sans } from "next/font/google";

export const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--loaded-jakarta",
});

export const jetBrainsMono = JetBrains_Mono({
  preload: false,
  subsets: ["latin"],
  variable: "--loaded-jetbrains",
});

export const lora = Lora({
  preload: false,
  subsets: ["latin"],
  variable: "--loaded-lora",
});

export const FONT_VARIABLE_CLASSES = [
  jakartaSans.variable,
  jetBrainsMono.variable,
  lora.variable,
].join(" ");
