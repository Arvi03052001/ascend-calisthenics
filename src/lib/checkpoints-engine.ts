import { db } from "@/lib/db";
import { SKILL_ROADMAP_161, SkillTier, SkillCategory } from "@/lib/skills-data";

export type CoreCheckpoint = {
  num?: number;
  id: string;
  skillName: string;
  tier?: SkillTier;
  category: string;
  targetMetric: string;
  targetNumeric: number;
  isTimeBased: boolean;
  isGateway?: boolean;
  achieved: boolean;
  bestValue: number;
  bestValueStr: string;
  completionPercent: number; // 0 to 100
  status: "mastered" | "developing" | "lagging" | "not_started";
};

export async function getUserCheckpoints(userId: string, tierFilter?: SkillTier) {
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

  const skillsToEvaluate = tierFilter
    ? SKILL_ROADMAP_161.filter((s) => s.tier === tierFilter)
    : SKILL_ROADMAP_161;

  const checkpointResults: CoreCheckpoint[] = [];

  for (const item of skillsToEvaluate) {
    const dbRecord = dbCheckpoints.find((c) => c.skillName === item.name);

    // Find best performance in logs matching exercise names exactly
    let bestVal = 0;
    for (const log of logs) {
      const logName = log.exerciseName.trim().toLowerCase();
      const isMatch = item.exerciseMatch.some((name) => {
        const targetName = name.trim().toLowerCase();
        return logName === targetName;
      });

      if (isMatch) {
        const val = item.isTimeBased ? (log.actualTime ?? 0) : (log.actualReps ?? 0);
        if (val > bestVal) bestVal = val;
      }
    }

    // Check manual override if saved in ProgressCheckpoint
    let achieved = dbRecord ? dbRecord.achieved : (bestVal >= item.targetNumeric && bestVal > 0);

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
        where: { userId_skillName: { userId, skillName: item.name } },
        create: {
          userId,
          skillName: item.name,
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
      num: item.num,
      id: item.id,
      skillName: item.name,
      tier: item.tier,
      category: item.category,
      targetMetric: item.targetMetric,
      targetNumeric: item.targetNumeric,
      isTimeBased: item.isTimeBased,
      isGateway: item.isGateway,
      achieved,
      bestValue: bestVal,
      bestValueStr,
      completionPercent,
      status,
    });
  }

  const masteredCount = checkpointResults.filter((c) => c.achieved).length;
  const totalCount = checkpointResults.length;
  const overallPercent = Math.round((masteredCount / (totalCount || 1)) * 100);

  // Core 11 Gateways summary
  const foundation11 = checkpointResults.filter((c) => c.tier === "Foundation" && c.isGateway);
  const foundation11Mastered = foundation11.filter((c) => c.achieved).length;

  // Identify top lagging exercises (unmastered, sorted by completionPercent ASC)
  const laggingFocusList = checkpointResults
    .filter((c) => !c.achieved)
    .sort((a, b) => a.completionPercent - b.completionPercent);

  return {
    masteredCount,
    totalCount,
    overallPercent,
    foundation11Mastered,
    foundation11Total: foundation11.length,
    checkpoints: checkpointResults,
    laggingFocusList,
  };
}
