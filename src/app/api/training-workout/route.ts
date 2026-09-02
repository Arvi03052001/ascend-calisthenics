import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { db } from "@/lib/db";

// GET /api/training-workout?dayIndex=0 — find existing workout for this day this week
export async function GET(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dayIndex = parseInt(new URL(req.url).searchParams.get("dayIndex") ?? "0");

  // Find Monday of this week
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  const dayOfWeek = monday.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(monday.getDate() + diff);

  const weekEnd = new Date(monday);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Look for existing workout with this dayIndex in notes
  const workout = await db.workout.findFirst({
    where: {
      userId,
      scheduledFor: { gte: monday, lt: weekEnd },
      notes: { contains: `dayIndex:${dayIndex}` },
    },
    include: { sessionLogs: true },
  });

  // Convert session logs to the entry format the frontend expects
  if (workout) {
    return NextResponse.json({
      workout: {
        id: workout.id,
        status: workout.status,
        entries: workout.sessionLogs.map(log => ({
          id: log.id,
          exerciseName: log.exerciseName,
          phase: log.phase,
          equipment: log.equipment,
          setNumber: log.setNumber,
          targetReps: log.targetReps,
          targetTime: log.targetTime,
          actualReps: log.actualReps,
          actualWeight: log.actualWeight,
          actualTime: log.actualTime,
          notes: log.notes,
          completed: log.completed,
        })),
      },
    });
  }

  return NextResponse.json({ workout: null });
}

// POST /api/training-workout — create a workout from the WeeklyPlan table
export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { dayIndex, exercises } = body;
  if (dayIndex === undefined) {
    return NextResponse.json({ error: "Missing dayIndex" }, { status: 400 });
  }

  // Get day info from WeeklyPlan table
  const dayNumber = dayIndex + 1;
  const planExercises = await db.weeklyPlan.findMany({
    where: { dayNumber },
    orderBy: [{ phase: "asc" }, { orderInPhase: "asc" }],
  });

  if (planExercises.length === 0) {
    return NextResponse.json({ error: "No exercises found for this day" }, { status: 404 });
  }

  const dayName = planExercises[0].dayName;
  const focus = planExercises[0].focus;

  // Calculate scheduled date
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  const dayOfWeek = monday.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(monday.getDate() + diff);

  const scheduledFor = new Date(monday);
  scheduledFor.setDate(monday.getDate() + dayIndex);

  // Create workout
  const workout = await db.workout.create({
    data: {
      userId,
      dayName,
      weekStart: monday,
      scheduledFor,
      title: `${dayName} — ${focus}`,
      status: "in_progress",
      notes: `dayIndex:${dayIndex}|${focus}`,
    },
  });

  // Create session logs from the WeeklyPlan data — start with 1 set per exercise
  // Users add more sets via the "+ Add Set" button as needed
  const sessionLogData = planExercises.map((ex) => {
    const targetIsTime = ex.repsOrDuration && (
      ex.repsOrDuration.toLowerCase().includes("sec") ||
      ex.repsOrDuration.toLowerCase().includes("min") ||
      ex.repsOrDuration.toLowerCase().includes("hold")
    );
    return {
      workoutId: workout.id,
      dayName: dayName,
      exerciseName: ex.exerciseName,
      phase: ex.phase,
      equipment: ex.equipment,
      setNumber: 1,
      targetReps: targetIsTime ? null : ex.repsOrDuration,
      targetTime: targetIsTime ? ex.repsOrDuration : null,
      completed: false,
    };
  });

  await db.sessionLog.createMany({ data: sessionLogData });

  // Fetch the workout with session logs
  const workoutWithLogs = await db.workout.findUnique({
    where: { id: workout.id },
    include: { sessionLogs: true },
  });

  return NextResponse.json({
    workout: {
      id: workoutWithLogs!.id,
      status: workoutWithLogs!.status,
      entries: workoutWithLogs!.sessionLogs.map(log => ({
        id: log.id,
        exerciseName: log.exerciseName,
        phase: log.phase,
        equipment: log.equipment,
        setNumber: log.setNumber,
        targetReps: log.targetReps,
        targetTime: log.targetTime,
        actualReps: log.actualReps,
        actualWeight: log.actualWeight,
        actualTime: log.actualTime,
        notes: log.notes,
        completed: log.completed,
      })),
    },
  });
}
