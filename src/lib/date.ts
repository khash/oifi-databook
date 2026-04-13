import jalaali from "jalaali-js"

const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

const MONTHS_FA = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
]

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]

function toPersianNum(n: number): string {
  return String(n).replace(/\d/g, (d) => PERSIAN_DIGITS[+d])
}

export interface FormattedDateResult {
  display: string
  persian: string
}

/**
 * Formats a variable-precision date string (YYYY, YYYY-MM, or YYYY-MM-DD)
 * into a human-friendly English display and a Persian (Jalali) equivalent.
 */
export function formatDate(dateStr: string): FormattedDateResult {
  const parts = dateStr.split("-").map(Number)
  const year = parts[0]
  const month = parts.length >= 2 ? parts[1] : undefined
  const day = parts.length >= 3 ? parts[2] : undefined

  let display: string
  let persian: string

  if (day && month) {
    display = `${day} ${MONTHS_EN[month - 1]} ${year}`
    const j = jalaali.toJalaali(year, month, day)
    persian = `${toPersianNum(j.jd)} ${MONTHS_FA[j.jm - 1]} ${toPersianNum(j.jy)}`
  } else if (month) {
    display = `${MONTHS_EN[month - 1]} ${year}`
    // Convert 1st of that month to get the Jalali month/year
    const j = jalaali.toJalaali(year, month, 1)
    persian = `${MONTHS_FA[j.jm - 1]} ${toPersianNum(j.jy)}`
  } else {
    display = String(year)
    // Convert mid-year (1 Farvardin ≈ 21 Mar) to get approximate Jalali year
    const j = jalaali.toJalaali(year, 3, 21)
    persian = toPersianNum(j.jy)
  }

  return { display, persian }
}

const MONTHS_EN_FULL: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}
const MONTHS_EN_SHORT: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function wrapWithPersian(display: string, persian: string): string {
  return `<span class="date-converted" title="${escapeHtml(persian)}">${display}</span>`
}

/**
 * Scans an HTML string for inline date patterns and wraps each with a
 * <span title="persian equivalent"> so the Persian calendar shows on hover.
 *
 * Recognised patterns:
 *  - "February 2011", "Jun 2024" (month + year)
 *  - "28 June 2024", "3 Feb 1979" (day + month + year)
 *  - "June 28, 2024" (month + day, year)
 *  - Bare four-digit years in ranges: "1989–1992", "1989-1992", "(1937)"
 *  - ISO-ish: "2024-06-28", "1988-07"
 */
export function annotateDatesInHtml(html: string): string {
  // Split HTML into tags and text segments, only process text segments
  return html.replace(/([^<]+)|(<[^>]+>)/g, (_segment, text, tag) => {
    if (tag) return tag // pass HTML tags through unchanged
    return annotateDatesInText(text)
  })
}

const MONTH_NAMES = "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec"

// Combined regex: tries longest patterns first via alternation.
// Group names: dmy = "16 January 1979", mdy = "January 16, 1979",
//              my = "February 2011", iso = "2024-06-28",
//              range = "1989–1992", year = standalone "1979"
const DATE_RE = new RegExp(
  `(?:` +
    // 1) day month year: "16 January 1979"
    `\\b(\\d{1,2})\\s+(${MONTH_NAMES})\\s+(\\d{4})\\b` +
  `)|(?:` +
    // 2) month day, year: "January 16, 1979"
    `\\b(${MONTH_NAMES})\\s+(\\d{1,2}),?\\s+(\\d{4})\\b` +
  `)|(?:` +
    // 3) month year: "February 2011"
    `\\b(${MONTH_NAMES})\\s+(\\d{4})\\b` +
  `)|(?:` +
    // 4) ISO: "2024-06-28" or "1988-07"
    `\\b(\\d{4})-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\\d|3[01]))?\\b` +
  `)|(?:` +
    // 5) year range: "1989–1992"
    `\\b(1[89]\\d{2}|20\\d{2})\\s*[–\\-]\\s*(1[89]\\d{2}|20\\d{2})\\b` +
  `)|(?:` +
    // 6) standalone year: "1979" (preceded by whitespace/punctuation)
    `(?<=[\\s(,;]|^)(1[89]\\d{2}|20\\d{2})(?=[\\s),;.!?–\\-]|$)` +
  `)`,
  "g",
)

function resolveMonth(s: string): number {
  return MONTHS_EN_FULL[s.toLowerCase()] ?? MONTHS_EN_SHORT[s.toLowerCase()]
}

function pad2(n: number | string): string {
  return String(n).padStart(2, "0")
}

function annotateDatesInText(text: string): string {
  return text.replace(DATE_RE, (match, ...args) => {
    const [
      dmyDay, dmyMonth, dmyYear,       // groups 1-3
      mdyMonth, mdyDay, mdyYear,       // groups 4-6
      myMonth, myYear,                  // groups 7-8
      isoYear, isoMonth, isoDay,       // groups 9-11
      rangeY1, rangeY2,                // groups 12-13
      standaloneYear,                   // group 14
    ] = args

    if (dmyDay && dmyMonth && dmyYear) {
      const m = resolveMonth(dmyMonth)
      const { persian } = formatDate(`${dmyYear}-${pad2(m)}-${pad2(dmyDay)}`)
      return wrapWithPersian(match, persian)
    }
    if (mdyMonth && mdyDay && mdyYear) {
      const m = resolveMonth(mdyMonth)
      const { persian } = formatDate(`${mdyYear}-${pad2(m)}-${pad2(mdyDay)}`)
      return wrapWithPersian(match, persian)
    }
    if (myMonth && myYear) {
      const m = resolveMonth(myMonth)
      const { persian } = formatDate(`${myYear}-${pad2(m)}`)
      return wrapWithPersian(match, persian)
    }
    if (isoYear && isoMonth) {
      const ds = isoDay ? `${isoYear}-${isoMonth}-${isoDay}` : `${isoYear}-${isoMonth}`
      const { display, persian } = formatDate(ds)
      return wrapWithPersian(display, persian)
    }
    if (rangeY1 && rangeY2) {
      const p1 = formatDate(rangeY1).persian
      const p2 = formatDate(rangeY2).persian
      return `${wrapWithPersian(rangeY1, p1)}–${wrapWithPersian(rangeY2, p2)}`
    }
    if (standaloneYear) {
      const { persian } = formatDate(standaloneYear)
      return wrapWithPersian(standaloneYear, persian)
    }
    return match
  })
}