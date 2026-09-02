import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getUserCheckpoints } from "@/lib/checkpoints-engine";
import { db } from "@/lib/db";

// GET /api/training-workout/checkpoints — get all 11 core checkpoints & lagging focus
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getUserCheckpoints(userId);
  return NextResponse.json(data);
}

// POST /api/training-workout/checkpoints — manual toggle of checkpoint status
export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { skillName, achieved, targetMetric, bestValue } = body;
  if (!skillName) return NextResponse.json({ error: "Missing skillName" }, { status: 400 });

  const record = await db.progressCheckpoint.upsert({
    where: { userId_skillName: { userId, skillName } },
    create: {
      userId,
      skillName,
      targetMetric: targetMetric || "Achieved",
      achieved: achieved ?? true,
      achievedAt: achieved ? new Date() : null,
      bestValue: bestValue || null,
    },
    update: {
      achieved: achieved ?? true,
      achievedAt: achieved ? new Date() : null,
      bestValue: bestValue || null,
    },
  });

  return NextResponse.json({ checkpoint: record });
}
