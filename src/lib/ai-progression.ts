import { db } from "@/lib/db";
import { formatIndianDate } from "@/lib/date-utils";

export type AIProgressionResult = {
  exerciseName: string;
  hasHistory: boolean;
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
 * Calculates adaptive AI progressive overload targets based on the user's previous performance.
 */
export async function getAIProgressionForExercise(
  userId: string,
  exerciseName: string,
  baselineTarget?: string | null
): Promise<AIProgressionResult> {
  // Find recent completed session logs for this user & exercise
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

  const isTimeBased = baselineTarget ? (
    baselineTarget.toLowerCase().includes("sec") ||
    baselineTarget.toLowerCase().includes("min") ||
    baselineTarget.toLowerCase().includes("hold")
  ) : false;

  if (recentLogs.length === 0) {
    return {
      exerciseName,
      hasHistory: false,
      lastLogged: null,
      aiTarget: {
        targetReps: null,
        targetTime: null,
        targetWeight: null,
        displayText: baselineTarget || "Baseline Set",
        overloadText: "First Session — Establish your baseline!",
      },
      coachingTip: `First time logging ${exerciseName}. Focus on clean form and log your true numbers!`,
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
  let aiTargetWeight: number | null = null;
  let displayText = "";
  let overloadText = "";
  let coachingTip = "";

  if (isTimeBased || maxTime !== null) {
    const lastTime = maxTime || 15;
    // Overload +5 seconds for hold exercises
    aiTargetTime = lastTime + 5;
    displayText = `${aiTargetTime} sec`;
    overloadText = `+5 sec growth goal (Last: ${lastTime} sec)`;
    coachingTip = `Last session on ${lastDayName || "previous day"} (${lastDateStr}) you held ${lastTime} sec. Today's AI Overload Goal is ${aiTargetTime} sec!`;
  } else {
    const lastReps = maxReps || 8;
    // Overload +2 reps for rep exercises
    aiTargetReps = lastReps + 2;
    displayText = `${aiTargetReps} reps`;
    overloadText = `+2 reps growth goal (Last: ${lastReps} reps)`;
    coachingTip = `Last session on ${lastDayName || "previous day"} (${lastDateStr}) you hit ${lastReps} reps. Today's AI Overload Goal is ${aiTargetReps} reps!`;
  }

  return {
    exerciseName,
    hasHistory: true,
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
