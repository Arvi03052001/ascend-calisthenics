/**
 * Muscle mapping dictionary for common calisthenics exercises.
 * Maps exercise names or partial matches to primary muscle groups.
 */

export const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Arms", "Core", "Legs"] as const;
export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export const EXERCISE_MUSCLE_MAP: Record<string, MuscleGroup[]> = {
  // Pushing (Chest, Shoulders, Triceps -> Arms)
  "Standard Push-Up": ["Chest", "Shoulders", "Arms"],
  "Push-Up": ["Chest", "Shoulders", "Arms"],
  "Wide Push-Up": ["Chest", "Shoulders"],
  "Incline Push-Up": ["Chest", "Shoulders"],
  "Decline Push-Up": ["Chest", "Shoulders"],
  "Diamond Push-Up": ["Chest", "Arms"],
  "Pseudo Planche Push-Up": ["Shoulders", "Chest"],
  "Planche Lean": ["Shoulders", "Arms"],
  "Planche": ["Shoulders", "Arms"],
  "Bench Dip": ["Arms", "Chest"],
  "Parallel Bar Dip": ["Chest", "Arms", "Shoulders"],
  "Straight Bar Dip": ["Chest", "Arms"],
  "Wall Push-Up": ["Chest", "Arms"],
  "Knee Push-Up": ["Chest", "Arms"],
  "Negative Push-Up": ["Chest", "Arms"],
  "Pike Push-Up": ["Shoulders", "Arms"],
  "Handstand": ["Shoulders", "Arms"],

  // Pulling (Back, Biceps -> Arms)
  "Passive Dead Hang": ["Back"],
  "Active Hang": ["Back"],
  "Scapular Pull-Up": ["Back"],
  "Towel Hang": ["Back", "Arms"],
  "Fingertip Hang Progression": ["Back", "Arms"],
  "Pull-Up Negative": ["Back", "Arms"],
  "Australian Pull-Up": ["Back", "Arms"],
  "Chin-Up": ["Back", "Arms"],
  "Pull-Up": ["Back", "Arms"],
  "Muscle-Up": ["Back", "Chest", "Arms"],
  "Front Lever": ["Back", "Core"],
  "Back Lever": ["Back", "Core", "Shoulders"],

  // Core
  "Plank": ["Core"],
  "Side Plank": ["Core"],
  "Hollow Body Hold": ["Core"],
  "Hollow Hold": ["Core"],
  "Arch Body Hold": ["Core"],
  "L-Sit": ["Core", "Arms"],
  "Lying Leg Raise": ["Core"],
  "Dead Bug": ["Core"],
  "Reverse Crunch": ["Core"],
  "Tuck Hold": ["Core", "Arms"],
  "Human Flag": ["Core", "Shoulders"],

  // Legs
  "Bodyweight Squat": ["Legs"],
  "Deep Squat Hold": ["Legs"],
  "Walking Lunge": ["Legs"],
  "Reverse Lunge": ["Legs"],
  "Bulgarian Split Squat": ["Legs"],
  "Pistol Squat": ["Legs"],
  "Shrimp Squat": ["Legs"],
};

/**
 * Given an exercise name, attempts to find the associated muscle groups.
 * Does a direct match first, then partial matching.
 */
export function getMuscleGroupsForExercise(exerciseName: string): MuscleGroup[] {
  const normalized = exerciseName.trim().toLowerCase();
  
  // 1. Direct match (case insensitive)
  const directMatch = Object.keys(EXERCISE_MUSCLE_MAP).find(
    (k) => k.toLowerCase() === normalized
  );
  if (directMatch) return EXERCISE_MUSCLE_MAP[directMatch];

  // 2. Partial match (e.g. "Weighted Pull-Up" -> matches "Pull-Up")
  for (const [key, groups] of Object.entries(EXERCISE_MUSCLE_MAP)) {
    if (normalized.includes(key.toLowerCase())) {
      return groups;
    }
  }

  // 3. Keyword fallback
  if (normalized.includes("push") || normalized.includes("dip")) return ["Chest", "Shoulders", "Arms"];
  if (normalized.includes("pull") || normalized.includes("chin") || normalized.includes("row")) return ["Back", "Arms"];
  if (normalized.includes("squat") || normalized.includes("lunge")) return ["Legs"];
  if (normalized.includes("plank") || normalized.includes("hold") || normalized.includes("raise")) return ["Core"];

  // Default fallback
  return [];
}
