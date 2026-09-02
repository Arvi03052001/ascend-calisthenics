/**
 * Timezone-safe Date Utilities for Monday-to-Sunday Week Calculations
 */

// Parse "YYYY-MM-DD" or Date into a UTC Date object at 00:00:00
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
  }
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
}

// Get Monday 00:00:00 UTC for any date input
export function getMonday(inputDate?: Date | string): Date {
  let d: Date;
  if (typeof inputDate === "string" && inputDate.trim().length > 0) {
    d = parseDateString(inputDate);
  } else if (inputDate instanceof Date) {
    d = new Date(Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 0, 0, 0, 0));
  } else {
    const now = new Date();
    d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
  }

  const dayOfWeek = d.getUTCDay(); // 0 is Sunday, 1 is Monday...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

// Format UTC Date into "YYYY-MM-DD"
export function formatYYYYMMDD(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format UTC Date into Indian "DD/MM/YYYY"
export function formatIndianDate(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
}
