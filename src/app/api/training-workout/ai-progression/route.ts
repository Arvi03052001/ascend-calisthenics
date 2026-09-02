import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getAIProgressionForExercise } from "@/lib/ai-progression";

// GET /api/training-workout/ai-progression?exerciseName=Scapular%20Pull-Up&baselineTarget=3x15
export async function GET(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const exerciseName = url.searchParams.get("exerciseName");
  const baselineTarget = url.searchParams.get("baselineTarget");

  if (!exerciseName) {
    return NextResponse.json({ error: "Missing exerciseName" }, { status: 400 });
  }

  const progression = await getAIProgressionForExercise(userId, exerciseName, baselineTarget);
  return NextResponse.json(progression);
}
