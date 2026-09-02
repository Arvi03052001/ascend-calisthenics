import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/weekly-plan?day=1 — fetch exercises for a specific day from the database
export async function GET(req: Request) {
  const dayParam = new URL(req.url).searchParams.get("day");
  const dayNumber = dayParam ? parseInt(dayParam) : null;

  const where = dayNumber ? { dayNumber } : {};
  const exercises = await db.weeklyPlan.findMany({
    where,
    orderBy: [{ dayNumber: "asc" }, { phase: "asc" }, { orderInPhase: "asc" }],
  });

  return NextResponse.json({ exercises });
}
