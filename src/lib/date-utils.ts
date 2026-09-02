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

// Formats seconds (e.g. 150) into natural human time e.g. "2m 30s", "45s", "3m"
export function formatHumanTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) {
    return "0s";
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m ${secs}s` : `${hrs}h ${secs}s`;
  }
  if (mins > 0) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  return `${secs}s`;
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

// Converts "HH:MM:SS", "MM:SS", "2m 30s", or total seconds string into total seconds integer
export function hhmmssToSeconds(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") return input;

  const str = String(input).trim().toLowerCase();
  if (!str) return null;

  // If input is purely numeric (e.g. "180" or "45")
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // Parse "2m 30s", "45s", "3m"
  const minMatch = str.match(/(\d+)\s*m/);
  const secMatch = str.match(/(\d+)\s*s/);
  const hrMatch = str.match(/(\d+)\s*h/);

  if (minMatch || secMatch || hrMatch) {
    let total = 0;
    if (hrMatch) total += parseInt(hrMatch[1], 10) * 3600;
    if (minMatch) total += parseInt(minMatch[1], 10) * 60;
    if (secMatch) total += parseInt(secMatch[1], 10);
    return total;
  }

  // If input contains ":" e.g. "00:03:00", "03:00", "1:30:00"
  const parts = str.split(":").map((p) => parseInt(p.trim(), 10));
  if (parts.some(isNaN)) return null;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }

  return null;
}
