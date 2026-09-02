import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUserId } from "@/lib/session";
import { db } from "@/lib/db";

const listSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(90),
});

// GET /api/weight-logs?days=90 — list user's weight logs ascending
export async function GET(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = req;
  const params = new URL(url).searchParams;
  const parsed = listSchema.safeParse({ days: params.get("days") ?? 90 });
  const days = parsed.success ? parsed.data.days : 90;

  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const logs = await db.weightLog.findMany({
    where: { userId, loggedAt: { gte: since } },
    orderBy: { loggedAt: "asc" },
    select: {
      id: true,
      weightKg: true,
      loggedAt: true,
      note: true,
    },
  });

  return NextResponse.json({ logs });
}

const createSchema = z.object({
  weightKg: z.coerce.number().min(35).max(250),
  loggedAt: z.string().optional(),
  note: z.string().max(200).optional(),
});

// POST /api/weight-logs — add a weigh-in and refresh currentWeightKg
export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const loggedAt = parsed.data.loggedAt ? new Date(parsed.data.loggedAt) : new Date();

  const log = await db.weightLog.create({
    data: {
      userId,
      weightKg: parsed.data.weightKg,
      loggedAt,
      note: parsed.data.note?.trim() || null,
    },
  });

  // Keep the user's cached "current weight" fresh (most recent log wins)
  await db.user.update({
    where: { id: userId },
    data: { currentWeightKg: parsed.data.weightKg },
  });

  return NextResponse.json({ log });
}
