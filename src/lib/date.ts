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