"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMuscleGroupsForExercise, MUSCLE_GROUPS, MuscleGroup } from "@/lib/muscle-mapping";

export type MuscleFatigueData = {
  group: MuscleGroup;
  sets: number;
  fatiguePercent: number;
  status: "Low" | "Optimal" | "High";
};

// Target weekly sets per muscle group for Optimal fatigue.
const OPTIMAL_SETS_TARGET = 15;

export async function getWeeklyMuscleFatigue(): Promise<MuscleFatigueData[]> {
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

  const muscleSets = new Map<MuscleGroup, number>();
  MUSCLE_GROUPS.forEach((m) => muscleSets.set(m, 0));

  completedLogs.forEach((log) => {
    const groups = getMuscleGroupsForExercise(log.exerciseName);
    groups.forEach((g) => {
      muscleSets.set(g, (muscleSets.get(g) || 0) + 1);
    });
  });

  const result: MuscleFatigueData[] = [];
  
  MUSCLE_GROUPS.forEach((group) => {
    const sets = muscleSets.get(group) || 0;
    const percent = Math.min(100, Math.round((sets / OPTIMAL_SETS_TARGET) * 100));
    let status: "Low" | "Optimal" | "High" = "Low";
    
    if (percent >= 75) status = "High";
    else if (percent >= 40) status = "Optimal";
    else status = "Low";

    result.push({
      group,
      sets,
      fatiguePercent: percent,
      status,
    });
  });

  return result;
}
