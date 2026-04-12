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

/**
 * Like renderMarkdown, but also injects data-entity-id and data-entity-type attributes
 * on links that point to internal entity pages (/people/, /orgs/, /events/).
 * Used on entity detail pages to enable hover cards.
 */
export function renderMarkdownWithEntities(
  text: string,
  entityIndex: Map<string, { entity_id: string; type: "person" | "org" | "event" }>,
): string {
  const m = new Marked({
    async: false,
    gfm: true,
    renderer: {
      link({ href, text: linkText }: { href: string; title: string | null; text: string }) {
        const match = href?.match(/^\/(people|orgs|events)\/([^/?#]+)/)
        if (match) {
          const slug = match[2]
          const entry = entityIndex.get(slug)
          if (entry) {
            return `<a href="${href}" data-entity-id="${entry.entity_id}" data-entity-type="${entry.type}">${linkText}</a>`
          }
        }
        return `<a href="${href}">${linkText}</a>`
      },
    },
  });
  return annotateDatesInHtml(m.parse(text) as string);
}

/** Strip markdown to plain text (for meta descriptions, JSON-LD, etc.). */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
    .replace(/[*_~`#>]+/g, "")               // remove formatting chars
    .replace(/\n+/g, " ")                     // collapse newlines
    .trim();
}
