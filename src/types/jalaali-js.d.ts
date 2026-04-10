declare module "jalaali-js" {
  interface JalaaliDate {
    jy: number
    jm: number
    jd: number
  }
  interface GregorianDate {
    gy: number
    gm: number
    gd: number
  }
  function toJalaali(gy: number, gm: number, gd: number): JalaaliDate
  function toGregorian(jy: number, jm: number, jd: number): GregorianDate
  function isValidJalaaliDate(jy: number, jm: number, jd: number): boolean
  function isLeapJalaaliYear(jy: number): boolean
  function jalaaliMonthLength(jy: number, jm: number): number
  export default { toJalaali, toGregorian, isValidJalaaliDate, isLeapJalaaliYear, jalaaliMonthLength }
}
