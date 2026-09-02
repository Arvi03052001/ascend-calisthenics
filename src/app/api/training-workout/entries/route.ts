import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/session";
import { db } from "@/lib/db";

const createSchema = z.object({
  workoutId: z.string(),
  exerciseName: z.string(),
  phase: z.string(),
  equipment: z.string().nullable().optional(),
  setNumber: z.number().int(),
  targetReps: z.string().nullable().optional(),
  targetTime: z.string().nullable().optional(),
});

// POST /api/training-workout/entries — add a new set entry
export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Verify the workout belongs to the user
  const workout = await db.workout.findUnique({
    where: { id: parsed.data.workoutId },
    select: { userId: true },
  });
  if (!workout || workout.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const created = await db.sessionLog.create({
    data: {
      workoutId: parsed.data.workoutId,
      exerciseName: parsed.data.exerciseName,
      phase: parsed.data.phase,
      equipment: parsed.data.equipment ?? null,
      setNumber: parsed.data.setNumber,
      targetReps: parsed.data.targetReps ?? null,
      targetTime: parsed.data.targetTime ?? null,
      completed: false,
    },
  });

  return NextResponse.json({
    entry: {
      id: created.id,
      exerciseName: created.exerciseName,
      phase: created.phase,
      equipment: created.equipment,
      setNumber: created.setNumber,
      targetReps: created.targetReps,
      targetTime: created.targetTime,
      actualReps: created.actualReps,
      actualWeight: created.actualWeight,
      actualTime: created.actualTime,
      notes: created.notes,
      completed: created.completed,
    },
  });
}
