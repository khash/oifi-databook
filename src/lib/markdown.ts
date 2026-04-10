import { Marked } from "marked";
import { annotateDatesInHtml } from "./date";

const marked = new Marked({
  async: false,
  gfm: true,
});

/** Convert markdown string to HTML, with inline dates annotated with Persian equivalents. */
export function renderMarkdown(text: string): string {
  return annotateDatesInHtml(marked.parse(text) as string);
}

/** Strip markdown to plain text (for meta descriptions, JSON-LD, etc.). */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
    .replace(/[*_~`#>]+/g, "")               // remove formatting chars
    .replace(/\n+/g, " ")                     // collapse newlines
    .trim();
}
