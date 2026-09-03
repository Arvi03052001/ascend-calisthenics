import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/session";
import { db } from "@/lib/db";

const regressSchema = z.object({
  workoutId: z.string(),
  originalExerciseName: z.string(),
  newExerciseName: z.string(),
  phase: z.string().optional(),
  targetReps: z.string().nullable().optional(),
  targetTime: z.string().nullable().optional(),
  equipment: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// POST /api/training-workout/regress — swap an exercise in an active workout for its calibrated regression
export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = regressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const {
    workoutId,
    originalExerciseName,
    newExerciseName,
    phase,
    targetReps,
    targetTime,
    equipment,
    notes,
  } = parsed.data;

  // Verify workout belongs to the user
  const workout = await db.workout.findUnique({
    where: { id: workoutId },
    select: { id: true, userId: true, dayName: true },
  });

  if (!workout || workout.userId !== userId) {
    return NextResponse.json({ error: "Workout not found or unauthorized" }, { status: 404 });
  }

  const whereClause: any = {
    workoutId,
    exerciseName: originalExerciseName,
  };
  if (phase) {
    whereClause.phase = phase;
  }

  const existingLogs = await db.sessionLog.findMany({
    where: whereClause,
  });

  const regressionNote = notes || `Regressed from ${originalExerciseName} — Tri-Phasic Motor Bridge`;

  if (existingLogs.length > 0) {
    // Update existing logs to the new regression exercise
    await db.sessionLog.updateMany({
      where: whereClause,
      data: {
        exerciseName: newExerciseName,
        targetReps: targetReps ?? null,
        targetTime: targetTime ?? null,
        equipment: equipment !== undefined ? equipment : undefined,
        notes: regressionNote,
      },
    });
  } else {
    // If no existing logs were found, insert set 1 for this exercise
    await db.sessionLog.create({
      data: {
        workoutId,
        dayName: workout.dayName,
        exerciseName: newExerciseName,
        phase: phase || "Main Workout",
        equipment: equipment ?? null,
        setNumber: 1,
        targetReps: targetReps ?? null,
        targetTime: targetTime ?? null,
        notes: regressionNote,
        completed: false,
      },
    });
  }

  // Fetch updated workout session logs
  const updatedWorkout = await db.workout.findUnique({
    where: { id: workoutId },
    include: { sessionLogs: { orderBy: { setNumber: "asc" } } },
  });

  return NextResponse.json({
    success: true,
    entries: updatedWorkout?.sessionLogs.map((log) => ({
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
  });
}
