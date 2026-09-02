import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/session";
import { db } from "@/lib/db";

const patchSchema = z.object({
  status: z.enum(["planned", "in_progress", "completed", "skipped"]).optional(),
  reset: z.boolean().optional(),
});

// PATCH /api/training-workout/[id] — update status or reset
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const workout = await db.workout.findUnique({ where: { id } });
  if (!workout || workout.userId !== userId) {
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

  if (parsed.data.reset) {
    await db.workout.delete({
      where: { id },
    });
    return NextResponse.json({ ok: true, reset: true });
  }

  const updated = await db.workout.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ workout: updated });
}
