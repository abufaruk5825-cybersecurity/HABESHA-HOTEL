/**
 * Ethiopian Calendar and Localization Utilities
 * HABESHA-HOTEL Management System
 */

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  monthNameAm: string;
  monthNameEn: string;
  formattedAm: string;
  formattedEn: string;
}

export const ETHIOPIAN_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

export const ETHIOPIAN_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
];

/**
 * Converts a Gregorian Date into an Ethiopian Date
 */
export function toEthiopianDate(gregorianDateInput: Date | string): EthiopianDate {
  const gDate = typeof gregorianDateInput === 'string' ? new Date(gregorianDateInput) : gregorianDateInput;
  if (isNaN(gDate.getTime())) {
    return {
      year: 2018,
      month: 1,
      day: 1,
      monthNameAm: ETHIOPIAN_MONTHS_AM[0],
      monthNameEn: ETHIOPIAN_MONTHS_EN[0],
      formattedAm: 'መስከረም 1, 2018 ዓ.ም.',
      formattedEn: 'Meskerem 1, 2018 E.C.'
    };
  }

  const gy = gDate.getFullYear();
  const gm = gDate.getMonth() + 1; // 1-12
  const gd = gDate.getDate();

  // Days in Gregorian months
  const gMonthDays = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Ethiopian new year is Sept 11 (or Sept 12 before a leap year)
  // Determine if previous Gregorian year was leap
  const isLeapGregorian = (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0);
  const newYearDay = isLeapGregorian ? 12 : 11;

  let ey = gy - 8;
  let em = 0;
  let ed = 0;

  // Day count from Sept 11/12
  const isAfterNewYear = (gm > 9) || (gm === 9 && gd >= newYearDay);
  if (isAfterNewYear) {
    ey = gy - 7;
  }

  // Calculate day difference from Ethiopian New Year
  const newYearDate = new Date(isAfterNewYear ? gy : gy - 1, 8, newYearDay); // Sept is month 8 in JS
  const diffTime = gDate.getTime() - newYearDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 0) {
    em = Math.floor(diffDays / 30) + 1;
    ed = (diffDays % 30) + 1;
    if (em > 13) {
      em = 13;
    }
  } else {
    // Before new year (in Pagume or earlier)
    const prevNewYear = new Date(gy - 1, 8, ((gy - 1) % 4 === 0 ? 12 : 11));
    const daysFromPrev = Math.floor((gDate.getTime() - prevNewYear.getTime()) / (1000 * 60 * 60 * 24));
    em = Math.floor(daysFromPrev / 30) + 1;
    ed = (daysFromPrev % 30) + 1;
    if (em > 13) {
      em = 13;
    }
  }

  const monthIdx = Math.max(0, Math.min(12, em - 1));
  const monthNameAm = ETHIOPIAN_MONTHS_AM[monthIdx];
  const monthNameEn = ETHIOPIAN_MONTHS_EN[monthIdx];

  return {
    year: ey,
    month: em,
    day: ed,
    monthNameAm,
    monthNameEn,
    formattedAm: `${monthNameAm} ${ed}, ${ey} ዓ.ም.`,
    formattedEn: `${monthNameEn} ${ed}, ${ey} E.C.`
  };
}

/**
 * Format date respecting Calendar mode ('gregorian' or 'ethiopian') and Language ('en' or 'am')
 */
export function formatHotelDate(
  dateInput: Date | string,
  calendar: 'gregorian' | 'ethiopian' = 'gregorian',
  language: 'en' | 'am' = 'en'
): string {
  if (!dateInput) return '';
  const gDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(gDate.getTime())) return String(dateInput);

  if (calendar === 'ethiopian') {
    const eth = toEthiopianDate(gDate);
    return language === 'am' ? eth.formattedAm : eth.formattedEn;
  }

  // Gregorian formatting
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return gDate.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', options) + ' (G.C.)';
}

/**
 * Validates Ethiopian Mobile Phone Number
 * Accepts: +251 9... / +251 7... / 09... / 07... with optional spaces/dashes
 */
export function validateEthiopianPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  // Matches +2519xxxxxxxx, +2517xxxxxxxx, 09xxxxxxxx, 07xxxxxxxx, 2519xxxxxxxx
  const ethRegex = /^(\+251|251|0)(9|7)\d{8}$/;
  return ethRegex.test(clean);
}

/**
 * Formats a clean Ethiopian Phone Number to standard international: +251 9X XXX XXXX
 */
export function formatEthiopianPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  let standard = clean;
  if (clean.startsWith('0')) {
    standard = '+251' + clean.slice(1);
  } else if (clean.startsWith('251')) {
    standard = '+' + clean;
  } else if (!clean.startsWith('+251')) {
    standard = '+251' + clean;
  }

  // Format as +251 9X XXX XXXX
  if (standard.length === 13) {
    return `${standard.slice(0, 4)} ${standard.slice(4, 6)} ${standard.slice(6, 9)} ${standard.slice(9)}`;
  }
  return standard;
}

