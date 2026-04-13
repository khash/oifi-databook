/**
 * check-links.mjs — Incremental external URL validator
 *
 * Checks all source/evidence URLs in content JSON files.
 * Results are cached in scripts/link-cache.json (COMMIT THIS FILE).
 * On subsequent builds, only new or stale URLs are re-checked.
 *
 * Env vars:
 *   SKIP_LINK_CHECK=1     — skip all checks (local rapid iteration)
 *   FORCE_RECHECK=1       — ignore cache, check every URL
 *   LINK_MAX_AGE_DAYS=N   — days before a cached result is considered stale (default: 30)
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, resolve } from "path";

const BROKEN_LINKS_PATH = join(resolve(process.cwd()), "scripts", "broken-links.md");

const ROOT = resolve(process.cwd());
const CACHE_PATH = join(ROOT, "scripts", "link-cache.json");
const CONTENT_DIR = join(ROOT, "content");

const SKIP = process.env.SKIP_LINK_CHECK === "1";
const FORCE = process.env.FORCE_RECHECK === "1";
const MAX_AGE_DAYS = parseInt(process.env.LINK_MAX_AGE_DAYS ?? "30", 10);
const TIMEOUT_MS = 8000;
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

if (SKIP) {
  console.log("⏭  SKIP_LINK_CHECK=1 — skipping link validation");
  process.exit(0);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadCache() {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n");
}

function isStale(entry) {
  if (!entry) return true;
  if (FORCE) return true;
  const age = Date.now() - new Date(entry.last_checked).getTime();
  return age > MAX_AGE_MS;
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function walkDir(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".json"))
      .map((e) => join(dir, e.name));
  } catch {
    return [];
  }
}

// ── URL collection ────────────────────────────────────────────────────────────

function collectUrls() {
  /** @type {Map<string, string[]>} url → [file, ...] */
  const urlToFiles = new Map();

  function add(url, file) {
    if (!url || typeof url !== "string") return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) return;
    const existing = urlToFiles.get(url) ?? [];
    existing.push(file);
    urlToFiles.set(url, existing);
  }

  for (const type of ["people", "orgs", "events"]) {
    for (const file of walkDir(join(CONTENT_DIR, type))) {
      const data = readJson(file);
      if (!data) continue;
      for (const src of data.sources ?? []) {
        add(src.url, file);
      }
    }
  }

  for (const file of walkDir(join(CONTENT_DIR, "connections"))) {
    const data = readJson(file);
    if (!data) continue;
    for (const ev of data.evidence ?? []) {
      add(ev.source_url, file);
    }
  }

  return urlToFiles;
}

// ── HTTP check ────────────────────────────────────────────────────────────────

async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const opts = {
    signal: controller.signal,
    redirect: "follow",
    headers: { "User-Agent": "oifi-databook-linkchecker/1.0" },
  };

  try {
    let res = await fetch(url, { method: "HEAD", ...opts });

    // Some servers reject HEAD; fall back to GET
    if (res.status === 405) {
      res = await fetch(url, { method: "GET", ...opts });
    }

    clearTimeout(timer);
    // 403/401 = bot-blocked, not necessarily a dead page
    if (res.status === 403 || res.status === 401) {
      return { ok: "bot-blocked", http_status: res.status };
    }
    return { ok: res.status < 400, http_status: res.status };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      return { ok: null, http_status: null, note: "timeout" };
    }
    // SSL errors, DNS failures, etc.
    return { ok: false, http_status: null, note: err.message?.slice(0, 80) };
  }
}

// ── Broken links report ───────────────────────────────────────────────────────

function renderGroup(lines, items) {
  const byStatus = new Map();
  for (const item of items) {
    const key = item.http_status ? `HTTP ${item.http_status}` : item.note ?? "unreachable";
    if (!byStatus.has(key)) byStatus.set(key, []);
    byStatus.get(key).push(item);
  }
  for (const [status, group] of [...byStatus.entries()].sort()) {
    lines.push(`### ${status} (${group.length})`);
    lines.push(``);
    for (const { url, files, last_checked } of group) {
      lines.push(`- ${url}`);
      for (const f of files) {
        lines.push(`  - \`${f.replace(ROOT + "/", "")}\``);
      }
      lines.push(`  - *last checked: ${last_checked?.slice(0, 10) ?? "unknown"}*`);
    }
    lines.push(``);
  }
}

function writeBrokenLinksReport(allBroken, allBotBlocked = []) {
  if (allBroken.length === 0 && allBotBlocked.length === 0) {
    writeFileSync(BROKEN_LINKS_PATH, `# Broken Links\n\nNo broken links found.\n`);
    return;
  }

  const lines = [
    `# Broken Links`,
    ``,
    `Last updated: ${new Date().toISOString().slice(0, 10)}  `,
    `Dead links (build-blocking): **${allBroken.length}** | Bot-blocked (verify manually): **${allBotBlocked.length}**`,
    ``,
  ];

  if (allBroken.length > 0) {
    lines.push(`## Dead Links (${allBroken.length})`);
    lines.push(``);
    lines.push(`These return 4xx/5xx or fail to connect. **The build fails until they are fixed.**`);
    lines.push(``);
    renderGroup(lines, allBroken);
  }

  if (allBotBlocked.length > 0) {
    lines.push(`## Bot-Blocked (${allBotBlocked.length})`);
    lines.push(``);
    lines.push(`These return 403/401 to automated requests but are likely accessible to human visitors. The build does not fail for these. Verify manually or replace with Wayback Machine archives.`);
    lines.push(``);
    renderGroup(lines, allBotBlocked);
  }

  writeFileSync(BROKEN_LINKS_PATH, lines.join("\n"));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const urlToFiles = collectUrls();
  const cache = loadCache();
  const now = new Date().toISOString();

  const toCheck = [];
  const skipped = [];

  for (const [url, files] of urlToFiles) {
    const entry = cache[url];
    if (!isStale(entry) && entry.status !== "invalid") {
      skipped.push(url);
    } else {
      // bot-blocked entries are re-checked on staleness only (not forced like invalid)
      toCheck.push({ url, files });
    }
  }

  console.log(
    `🔗 Link check: ${toCheck.length} to check, ${skipped.length} cached (max age ${MAX_AGE_DAYS}d)`
  );

  if (toCheck.length === 0) {
    console.log("✅ All links are cached and valid.");
    return;
  }

  const broken = [];
  const unknown = [];
  let checked = 0;

  // Check in batches of 8 to avoid overwhelming servers
  const BATCH = 8;
  for (let i = 0; i < toCheck.length; i += BATCH) {
    const batch = toCheck.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async ({ url, files }) => {
        const result = await checkUrl(url);
        checked++;

        if (result.ok === true) {
          cache[url] = { status: "valid", http_status: result.http_status, last_checked: now };
        } else if (result.ok === "bot-blocked") {
          cache[url] = { status: "bot-blocked", http_status: result.http_status, last_checked: now };
        } else if (result.ok === false) {
          cache[url] = {
            status: "invalid",
            http_status: result.http_status,
            note: result.note,
            last_checked: now,
          };
          broken.push({ url, files, http_status: result.http_status, note: result.note });
        } else {
          // Timeout or unknown — preserve previous status if any, don't fail build
          cache[url] = {
            status: cache[url]?.status ?? "unknown",
            http_status: null,
            note: result.note,
            last_checked: now,
          };
          unknown.push({ url, note: result.note });
        }

        const pct = Math.round((checked / toCheck.length) * 100);
        process.stdout.write(`\r  Progress: ${checked}/${toCheck.length} (${pct}%)   `);
      })
    );
  }

  process.stdout.write("\n");
  saveCache(cache);

  // Build full broken/bot-blocked lists from entire cache (not just this run's checked URLs)
  const allBroken = [];
  const allBotBlocked = [];
  for (const [url, files] of urlToFiles) {
    const entry = cache[url];
    if (entry?.status === "invalid") {
      allBroken.push({ url, files, http_status: entry.http_status, note: entry.note, last_checked: entry.last_checked });
    } else if (entry?.status === "bot-blocked") {
      allBotBlocked.push({ url, files, http_status: entry.http_status, last_checked: entry.last_checked });
    }
  }
  writeBrokenLinksReport(allBroken, allBotBlocked);

  if (unknown.length > 0) {
    console.warn(`\n⚠️  ${unknown.length} URL(s) could not be reached (timeout/network) — not failing build:`);
    for (const { url, note } of unknown) {
      console.warn(`   ${url}  (${note ?? "unknown error"})`);
    }
  }

  if (allBotBlocked.length > 0) {
    console.warn(`\n⚠️  ${allBotBlocked.length} bot-blocked URL(s) (403/401) — not failing build. See scripts/broken-links.md.`);
  }

  if (allBroken.length > 0) {
    console.error(`\n❌ ${allBroken.length} dead link(s) found (see scripts/broken-links.md):\n`);
    for (const { url, files, http_status, note } of allBroken) {
      const label = http_status ? `HTTP ${http_status}` : note ?? "unreachable";
      console.error(`  [${label}] ${url}`);
      for (const f of files) {
        console.error(`    → ${f.replace(ROOT + "/", "")}`);
      }
    }
    console.error(
      "\nFix or remove the broken links above, then run the build again.\n" +
        "If a link is temporarily down, set SKIP_LINK_CHECK=1 to bypass."
    );
    process.exit(1);
  }

  console.log(`✅ All ${checked} checked link(s) are valid.`);
}

main().catch((err) => {
  console.error("Link checker error:", err);
  process.exit(1);
});
