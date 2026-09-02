import { db } from "@/lib/db";

export type CoreCheckpoint = {
  id: string;
  skillName: string;
  category: "Hanging/Grip" | "Pushing" | "Core" | "Legs" | "Mobility";
  targetMetric: string;
  targetNumeric: number;
  isTimeBased: boolean;
  achieved: boolean;
  bestValue: number;
  bestValueStr: string;
  completionPercent: number; // 0 to 100
  status: "mastered" | "developing" | "lagging" | "not_started";
};

export const CORE_11_CHECKPOINTS = [
  { id: "dead_hang", skillName: "Dead Hang", category: "Hanging/Grip" as const, targetMetric: "60 sec", targetNumeric: 60, isTimeBased: true, exerciseMatch: ["Dead Hang", "Passive Dead Hang"] },
  { id: "active_hang", skillName: "Active Hang", category: "Hanging/Grip" as const, targetMetric: "30 sec", targetNumeric: 30, isTimeBased: true, exerciseMatch: ["Active Hang"] },
  { id: "scapular_pullup", skillName: "Scapular Pull-Up", category: "Hanging/Grip" as const, targetMetric: "3 x 10", targetNumeric: 10, isTimeBased: false, exerciseMatch: ["Scapular Pull-Up", "Scapular Control"] },
  { id: "pushup", skillName: "Push-Up", category: "Pushing" as const, targetMetric: "3 x 15", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["Standard Push-Up", "Push-Up"] },
  { id: "bench_dip", skillName: "Bench Dip", category: "Pushing" as const, targetMetric: "3 x 15", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["Bench Dip"] },
  { id: "hollow_hold", skillName: "Hollow Hold", category: "Core" as const, targetMetric: "45 sec", targetNumeric: 45, isTimeBased: true, exerciseMatch: ["Hollow Hold", "Hollow Body Hold"] },
  { id: "leg_raise", skillName: "Lying Leg Raise", category: "Core" as const, targetMetric: "3 x 12", targetNumeric: 12, isTimeBased: false, exerciseMatch: ["Lying Leg Raise", "Reverse Crunch"] },
  { id: "squat", skillName: "Bodyweight Squat", category: "Legs" as const, targetMetric: "3 x 20", targetNumeric: 20, isTimeBased: false, exerciseMatch: ["Bodyweight Squat"] },
  { id: "split_squat", skillName: "Bulgarian Split Squat", category: "Legs" as const, targetMetric: "3 x 10/leg", targetNumeric: 10, isTimeBased: false, exerciseMatch: ["Bulgarian Split Squat"] },
  { id: "squat_hold", skillName: "Deep Squat Hold", category: "Legs" as const, targetMetric: "60 sec", targetNumeric: 60, isTimeBased: true, exerciseMatch: ["Deep Squat Hold", "Deep Squat Mobility"] },
  { id: "tuck_hold", skillName: "Tuck Hold", category: "Core" as const, targetMetric: "30 sec", targetNumeric: 30, isTimeBased: true, exerciseMatch: ["Tuck Hold"] },
];

export async function getUserCheckpoints(userId: string) {
  // Fetch completed session logs for user
  const logs = await db.sessionLog.findMany({
    where: {
      completed: true,
      workout: { userId },
    },
    select: {
      exerciseName: true,
      actualReps: true,
      actualTime: true,
      actualWeight: true,
    },
  });

  // Fetch DB overrides/manual achievements from ProgressCheckpoint table
  const dbCheckpoints = await db.progressCheckpoint.findMany({
    where: { userId },
  });

  const checkpointResults: CoreCheckpoint[] = [];

  for (const item of CORE_11_CHECKPOINTS) {
    const dbRecord = dbCheckpoints.find((c) => c.skillName === item.skillName);

    // Find best performance in logs matching exercise names
    let bestVal = 0;
    for (const log of logs) {
      if (item.exerciseMatch.some((name) => log.exerciseName.toLowerCase().includes(name.toLowerCase()))) {
        const val = item.isTimeBased ? (log.actualTime ?? 0) : (log.actualReps ?? 0);
        if (val > bestVal) bestVal = val;
      }
    }

    // Check manual override if saved in ProgressCheckpoint
    let achieved = dbRecord?.achieved ?? (bestVal >= item.targetNumeric);

    const completionPercent = Math.min(100, Math.round((bestVal / item.targetNumeric) * 100));

    let status: "mastered" | "developing" | "lagging" | "not_started" = "not_started";
    if (achieved || completionPercent >= 100) {
      status = "mastered";
      achieved = true;
    } else if (completionPercent >= 50) {
      status = "developing";
    } else if (completionPercent > 0) {
      status = "lagging";
    } else {
      status = "not_started";
    }

    const bestValueStr = item.isTimeBased
      ? bestVal > 0 ? `${bestVal} sec` : "None"
      : bestVal > 0 ? `${bestVal} reps` : "None";

    // Auto-sync database record if achieved
    if (achieved && (!dbRecord || !dbRecord.achieved)) {
      await db.progressCheckpoint.upsert({
        where: { userId_skillName: { userId, skillName: item.skillName } },
        create: {
          userId,
          skillName: item.skillName,
          targetMetric: item.targetMetric,
          achieved: true,
          achievedAt: new Date(),
          bestValue: bestValueStr,
        },
        update: {
          achieved: true,
          achievedAt: new Date(),
          bestValue: bestValueStr,
        },
      }).catch(() => {});
    }

    checkpointResults.push({
      id: item.id,
      skillName: item.skillName,
      category: item.category,
      targetMetric: item.targetMetric,
      targetNumeric: item.targetNumeric,
      isTimeBased: item.isTimeBased,
      achieved,
      bestValue: bestVal,
      bestValueStr,
      completionPercent,
      status,
    });
  }

  const masteredCount = checkpointResults.filter((c) => c.achieved).length;
  const totalCount = checkpointResults.length;
  const overallPercent = Math.round((masteredCount / totalCount) * 100);

  // Identify top lagging exercises (unmastered, sorted by completionPercent ASC so lowest % is #1 priority)
  const laggingFocusList = checkpointResults
    .filter((c) => !c.achieved)
    .sort((a, b) => a.completionPercent - b.completionPercent);

  return {
    masteredCount,
    totalCount,
    overallPercent,
    checkpoints: checkpointResults,
    laggingFocusList,
  };
}
