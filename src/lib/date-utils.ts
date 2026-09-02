/**
 * Timezone-safe Date & Time Utilities for Ascend Calisthenics
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

// Converts seconds (e.g. 180 or 45) to "HH:MM:SS" (e.g. "00:03:00" or "00:00:45")
export function secondsToHHMMSS(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) {
    return "00:00:00";
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Converts "HH:MM:SS", "MM:SS", or total seconds string into total seconds integer
export function hhmmssToSeconds(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") return input;

  const str = String(input).trim();
  if (!str) return null;

  // If input is purely numeric (e.g. "180" or "45")
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // If input contains ":" e.g. "00:03:00", "03:00", "1:30:00"
  const parts = str.split(":").map((p) => parseInt(p.trim(), 10));
  if (parts.some(isNaN)) return null;

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }

  return null;
}
