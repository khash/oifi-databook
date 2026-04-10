import { Marked } from "marked";

const marked = new Marked({
  async: false,
  gfm: true,
});

/** Convert markdown string to HTML. */
export function renderMarkdown(text: string): string {
  return marked.parse(text) as string;
}

/** Strip markdown to plain text (for meta descriptions, JSON-LD, etc.). */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
    .replace(/[*_~`#>]+/g, "")               // remove formatting chars
    .replace(/\n+/g, " ")                     // collapse newlines
    .trim();
}
