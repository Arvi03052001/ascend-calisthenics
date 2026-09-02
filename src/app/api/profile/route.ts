import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { onboardingSchema } from "@/lib/validators";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/** Compute age from date of birth (or return null). */
function computeAge(dob: Date | null): number | null {
  if (!dob) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 0 && age <= 120 ? age : null;
}

// GET /api/profile — current user's profile
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      sex: true,
      dateOfBirth: true,
      age: true,
      heightCm: true,
      startWeightKg: true,
      targetWeightKg: true,
      currentWeightKg: true,
      experienceLevel: true,
      trainingDays: true,
      goal: true,
      onboardedAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Always compute age from DOB if available (falls back to stored age)
  const computedAge = computeAge(user.dateOfBirth) ?? user.age;
  return NextResponse.json({
    profile: { ...user, age: computedAge, dateOfBirth: user.dateOfBirth?.toISOString() ?? null },
  });
}

// PATCH /api/profile — save onboarding / update profile fields
export async function PATCH(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const dob = new Date(d.dateOfBirth);
  const computedAge = computeAge(dob);

  const updated = await db.user.update({
    where: { id: userId },
    data: {
      sex: d.sex,
      dateOfBirth: dob,
      age: computedAge, // store computed age for backward compat
      heightCm: d.heightCm,
      startWeightKg: d.startWeightKg,
      targetWeightKg: d.targetWeightKg,
      currentWeightKg: d.startWeightKg,
      experienceLevel: d.experienceLevel,
      trainingDays: d.trainingDays,
      goal: d.goal ?? null,
      onboardedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      sex: true,
      dateOfBirth: true,
      age: true,
      heightCm: true,
      startWeightKg: true,
      targetWeightKg: true,
      currentWeightKg: true,
      experienceLevel: true,
      trainingDays: true,
      goal: true,
      onboardedAt: true,
    },
  });

  await db.weightLog.create({
    data: {
      userId,
      weightKg: d.startWeightKg,
      loggedAt: new Date(),
      note: "Starting weight",
    },
  });

  return NextResponse.json({
    profile: { ...updated, age: computedAge, dateOfBirth: dob.toISOString() },
  });
}
