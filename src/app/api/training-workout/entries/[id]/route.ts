import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/session";
import { db } from "@/lib/db";

const patchSchema = z.object({
  actualReps: z.number().int().nullable().optional(),
  actualWeight: z.number().nullable().optional(),
  actualTime: z.number().int().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  completed: z.boolean().optional(),
});

// PATCH /api/training-workout/entries/[id] — log actual performance
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const log = await db.sessionLog.findUnique({
    where: { id },
    include: { workout: { select: { userId: true } } },
  });
  if (!log || log.workout.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await db.sessionLog.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({
    entry: {
      id: updated.id,
      exerciseName: updated.exerciseName,
      phase: updated.phase,
      equipment: updated.equipment,
      setNumber: updated.setNumber,
      targetReps: updated.targetReps,
      targetTime: updated.targetTime,
      actualReps: updated.actualReps,
      actualWeight: updated.actualWeight,
      actualTime: updated.actualTime,
      notes: updated.notes,
      completed: updated.completed,
    },
  });
}

// DELETE /api/training-workout/entries/[id] — remove a set entry
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const log = await db.sessionLog.findUnique({
    where: { id },
    include: { workout: { select: { userId: true } } },
  });
  if (!log || log.workout.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.sessionLog.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
