import { NextRequest, NextResponse } from "next/server";
import { getExerciseDemo } from "@/lib/exercise-demo";

const cache = new Map<string, { data: ReturnType<typeof getExerciseDemo>; ts: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name") ?? "";
  if (!name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const key = name.toLowerCase().trim();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const result = getExerciseDemo(name);
  cache.set(key, { data: result, ts: Date.now() });
  return NextResponse.json(result);
}
