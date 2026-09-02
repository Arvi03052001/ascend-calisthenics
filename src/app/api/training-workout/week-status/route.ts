import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { db } from "@/lib/db";

// GET /api/training-workout/week-status?weekStart=2026-08-31
export async function GET(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const weekStartParam = url.searchParams.get("weekStart");

  // Calculate Monday of requested week or current week
  let monday = new Date();
  if (weekStartParam) {
    const parsed = new Date(weekStartParam);
    if (!isNaN(parsed.getTime())) {
      monday = parsed;
    }
  }

  monday.setHours(0, 0, 0, 0);
  const dayOfWeek = monday.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(monday.getDate() + diff);

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const weekEnd = new Date(monday);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Fetch all workouts for this user in this week
  const workouts = await db.workout.findMany({
    where: {
      userId,
      scheduledFor: { gte: monday, lt: weekEnd },
    },
    include: {
      sessionLogs: {
        select: { completed: true },
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build status for days 0..5 (Monday..Saturday)
  const daysStatus = [0, 1, 2, 3, 4, 5].map((dayIndex) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + dayIndex);

    // Find workout matching dayIndex in notes or dayName
    const workout = workouts.find((w) => w.notes?.includes(`dayIndex:${dayIndex}`));

    let status: "completed" | "in_progress" | "missed" | "upcoming" = "upcoming";

    if (workout) {
      if (workout.status === "completed") {
        status = "completed";
      } else if (workout.status === "in_progress") {
        status = "in_progress";
      }
    } else {
      if (dayDate < today) {
        status = "missed";
      } else {
        status = "upcoming";
      }
    }

    return {
      dayIndex,
      dateStr: dayDate.toISOString().split("T")[0],
      formattedDate: `${String(dayDate.getDate()).padStart(2, "0")}/${String(dayDate.getMonth() + 1).padStart(2, "0")}/${dayDate.getFullYear()}`,
      isToday: dayDate.getTime() === today.getTime(),
      status,
      workoutId: workout?.id || null,
      loggedSets: workout ? workout.sessionLogs.filter((s) => s.completed).length : 0,
      totalSets: workout ? workout.sessionLogs.length : 0,
    };
  });

  return NextResponse.json({
    weekStartStr: monday.toISOString().split("T")[0],
    formattedWeekRange: `${String(monday.getDate()).padStart(2, "0")}/${String(monday.getMonth() + 1).padStart(2, "0")}/${monday.getFullYear()} – ${String(sunday.getDate()).padStart(2, "0")}/${String(sunday.getMonth() + 1).padStart(2, "0")}/${sunday.getFullYear()}`,
    days: daysStatus,
  });
}
