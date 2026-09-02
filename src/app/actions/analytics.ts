"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAnatomicalMusclesForExercise, type AnatomicalMuscle } from "@/lib/muscle-mapping";

export type ExerciseHeatmapData = {
  name: string;
  muscles: AnatomicalMuscle[];
  frequency: number;
};

export async function getWeeklyMuscleFatigue(): Promise<ExerciseHeatmapData[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return [];
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return [];

  // Calculate past 7 days window
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);

  const completedLogs = await db.sessionLog.findMany({
    where: {
      completed: true,
      workout: {
        userId: user.id,
        scheduledFor: {
          gte: sevenDaysAgo,
        },
      },
    },
    select: {
      exerciseName: true,
    },
  });

  // Aggregate frequency by exercise name
  const exerciseCounts = new Map<string, number>();
  completedLogs.forEach((log) => {
    const name = log.exerciseName;
    exerciseCounts.set(name, (exerciseCounts.get(name) || 0) + 1);
  });

  const result: ExerciseHeatmapData[] = [];
  
  exerciseCounts.forEach((frequency, name) => {
    const muscles = getAnatomicalMusclesForExercise(name);
    if (muscles.length > 0) {
      result.push({
        name,
        muscles,
        frequency
      });
    }
  });

  return result;
}
