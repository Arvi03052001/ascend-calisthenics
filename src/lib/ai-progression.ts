import { db } from "@/lib/db";
import { formatIndianDate, secondsToHHMMSS } from "@/lib/date-utils";
import { SKILL_ROADMAP_161 } from "@/lib/skills-data";

export type AIProgressionResult = {
  exerciseName: string;
  hasHistory: boolean;
  roadmapTarget: string | null;
  roadmapNumeric: number | null;
  lastLogged: {
    actualReps: number | null;
    actualTime: number | null;
    actualWeight: number | null;
    dateFormatted: string | null;
    setNumber: number | null;
  } | null;
  aiTarget: {
    targetReps: number | null;
    targetTime: number | null;
    targetWeight: number | null;
    displayText: string;
    overloadText: string;
  };
  coachingTip: string;
};

/**
 * Calculates adaptive AI progressive overload targets based on previous performance & Skill Roadmap benchmarks.
 */
export async function getAIProgressionForExercise(
  userId: string,
  exerciseName: string,
  baselineTarget?: string | null
): Promise<AIProgressionResult> {
  // 1. Look up skill in 161 Calisthenics Skill Tree Roadmap
  const trimmedName = exerciseName.trim().toLowerCase();
  const matchedSkill = SKILL_ROADMAP_161.find((s) =>
    s.exerciseMatch.some((m) => m.trim().toLowerCase() === trimmedName) ||
    s.name.trim().toLowerCase() === trimmedName
  );

  // 2. Find recent completed session logs for this user & exercise
  const recentLogs = await db.sessionLog.findMany({
    where: {
      exerciseName,
      completed: true,
      workout: { userId },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { workout: { select: { scheduledFor: true, dayName: true } } },
  });

  const isTimeBased = matchedSkill ? matchedSkill.isTimeBased : baselineTarget ? (
    baselineTarget.toLowerCase().includes("sec") ||
    baselineTarget.toLowerCase().includes("min") ||
    baselineTarget.toLowerCase().includes("hold")
  ) : false;

  const roadmapTargetMetric = matchedSkill?.targetMetric || baselineTarget || null;
  const roadmapNumeric = matchedSkill?.targetNumeric || null;

  // If no previous history logged yet
  if (recentLogs.length === 0) {
    let firstTargetStr = baselineTarget || "Baseline Set";
    let firstTip = `First time logging ${exerciseName}. Focus on clean form and log your true numbers!`;

    if (matchedSkill) {
      firstTip = `Roadmap Benchmark: ${matchedSkill.targetMetric}. Establish your baseline today and AI will scale your numbers step-by-step!`;
    }

    return {
      exerciseName,
      hasHistory: false,
      roadmapTarget: roadmapTargetMetric,
      roadmapNumeric,
      lastLogged: null,
      aiTarget: {
        targetReps: null,
        targetTime: null,
        targetWeight: null,
        displayText: firstTargetStr,
        overloadText: matchedSkill ? `Target: ${matchedSkill.targetMetric}` : "First Session — Establish baseline!",
      },
      coachingTip: firstTip,
    };
  }

  // Calculate best/max effort from recent logs
  let maxReps: number | null = null;
  let maxTime: number | null = null;
  let maxWeight: number | null = null;
  let lastDateStr: string | null = null;
  let lastDayName: string | null = null;

  for (const log of recentLogs) {
    if (log.actualReps !== null && (maxReps === null || log.actualReps > maxReps)) {
      maxReps = log.actualReps;
    }
    if (log.actualTime !== null && (maxTime === null || log.actualTime > maxTime)) {
      maxTime = log.actualTime;
    }
    if (log.actualWeight !== null && (maxWeight === null || log.actualWeight > maxWeight)) {
      maxWeight = log.actualWeight;
    }
    if (!lastDateStr && log.workout?.scheduledFor) {
      lastDateStr = formatIndianDate(log.workout.scheduledFor);
      lastDayName = log.workout.dayName;
    }
  }

  let aiTargetReps: number | null = null;
  let aiTargetTime: number | null = null;
  let displayText = "";
  let overloadText = "";
  let coachingTip = "";

  if (isTimeBased || maxTime !== null) {
    const lastTime = maxTime || 10;
    // Step up +2 to +5 seconds toward roadmap hold target
    const step = lastTime < 30 ? 3 : 5;
    aiTargetTime = lastTime + step;

    // Cap at roadmap target if reached
    if (roadmapNumeric && aiTargetTime > roadmapNumeric) {
      aiTargetTime = roadmapNumeric;
    }

    const formattedTarget = secondsToHHMMSS(aiTargetTime);
    const formattedLast = secondsToHHMMSS(lastTime);

    displayText = formattedTarget;
    overloadText = `+${step}s growth step (Last: ${formattedLast})`;
    
    if (roadmapNumeric) {
      const pct = Math.min(100, Math.round((lastTime / roadmapNumeric) * 100));
      coachingTip = `Last session on ${lastDayName || "previous day"} (${lastDateStr}) you held ${formattedLast} (${pct}% of target). Today's AI Goal is ${formattedTarget} to build toward your ${roadmapTargetMetric} benchmark!`;
    } else {
      coachingTip = `Last session on ${lastDayName || "previous day"} (${lastDateStr}) you held ${formattedLast}. Today's AI Overload Goal is ${formattedTarget}!`;
    }
  } else {
    const lastReps = maxReps || 8;
    // Step up +2 to +3 reps toward roadmap rep target
    const step = lastReps < 15 ? 2 : 3;
    aiTargetReps = lastReps + step;

    // Cap at roadmap target if reached
    if (roadmapNumeric && aiTargetReps > roadmapNumeric) {
      aiTargetReps = roadmapNumeric;
    }

    displayText = `${aiTargetReps} reps`;
    overloadText = `+${step} reps growth step (Last: ${lastReps} reps)`;

    if (roadmapNumeric) {
      const pct = Math.min(100, Math.round((lastReps / roadmapNumeric) * 100));
      coachingTip = `Last session on ${lastDayName || "previous day"} (${lastDateStr}) you hit ${lastReps} reps (${pct}% of target). Today's AI Goal is ${aiTargetReps} reps to build toward your ${roadmapTargetMetric} benchmark!`;
    } else {
      coachingTip = `Last session on ${lastDayName || "previous day"} (${lastDateStr}) you hit ${lastReps} reps. Today's AI Overload Goal is ${aiTargetReps} reps!`;
    }
  }

  return {
    exerciseName,
    hasHistory: true,
    roadmapTarget: roadmapTargetMetric,
    roadmapNumeric,
    lastLogged: {
      actualReps: maxReps,
      actualTime: maxTime,
      actualWeight: maxWeight,
      dateFormatted: lastDateStr,
      setNumber: recentLogs[0]?.setNumber || 1,
    },
    aiTarget: {
      targetReps: aiTargetReps,
      targetTime: aiTargetTime,
      targetWeight: maxWeight,
      displayText,
      overloadText,
    },
    coachingTip,
  };
}
