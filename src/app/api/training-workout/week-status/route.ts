import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { getMonday, formatYYYYMMDD, formatIndianDate } from "@/lib/date-utils";

// GET /api/training-workout/week-status?weekStart=2026-08-31
export async function GET(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const weekStartParam = url.searchParams.get("weekStart");

  // Timezone-safe Monday calculation
  const monday = getMonday(weekStartParam || undefined);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  const weekEnd = new Date(monday);
  weekEnd.setUTCDate(monday.getUTCDate() + 7);

  // Fetch all workouts for this user in this week range
  const workouts = await db.workout.findMany({
    where: {
      userId,
      scheduledFor: { gte: monday, lt: weekEnd },
    },
    include: {
      sessionLogs: { select: { completed: true } },
    },
  });

  const todayMonday = getMonday();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  // Build status for days 0..5 (Monday..Saturday)
  const daysStatus = [0, 1, 2, 3, 4, 5].map((dayIndex) => {
    const dayDate = new Date(monday);
    dayDate.setUTCDate(monday.getUTCDate() + dayIndex);

    // Find workout matching dayIndex in notes
    const workout = workouts.find((w) => w.notes?.includes(`dayIndex:${dayIndex}`));

    let status: "completed" | "in_progress" | "missed" | "upcoming" = "upcoming";

    if (workout) {
      if (workout.status === "completed") {
        status = "completed";
      } else if (workout.status === "in_progress") {
        status = "in_progress";
      }
    } else {
      // Compare dates in UTC to check if past
      const todayUTC = new Date(Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0));
      if (dayDate.getTime() < todayUTC.getTime()) {
        status = "missed";
      } else {
        status = "upcoming";
      }
    }

    const todayUTC = new Date(Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0));
    const isToday = dayDate.getTime() === todayUTC.getTime();

    return {
      dayIndex,
      dateStr: formatYYYYMMDD(dayDate),
      formattedDate: formatIndianDate(dayDate),
      isToday,
      status,
      workoutId: workout?.id || null,
      loggedSets: workout ? workout.sessionLogs.filter((s) => s.completed).length : 0,
      totalSets: workout ? workout.sessionLogs.length : 0,
    };
  });

  return NextResponse.json({
    weekStartStr: formatYYYYMMDD(monday),
    formattedWeekRange: `${formatIndianDate(monday)} – ${formatIndianDate(sunday)}`,
    days: daysStatus,
  });
}
