import { THEME_STORAGE_KEY } from "./theme-preference";

const SCRIPT = `var root=document.documentElement,media=matchMedia("(prefers-color-scheme: dark)");try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light"||t==="dark")root.dataset.theme=t}catch(e){}var sync=function(){root.classList.toggle("dark",root.dataset.theme==="dark"||(!root.dataset.theme&&media.matches))};sync();media.addEventListener("change",sync);`;

export function ThemeScript({ nonce }: { nonce?: string }) {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: fixed inline script, no user input
      dangerouslySetInnerHTML={{ __html: SCRIPT }}
      nonce={nonce}
    />
  );
}
