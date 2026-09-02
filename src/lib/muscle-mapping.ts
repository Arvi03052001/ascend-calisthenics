/**
 * Muscle mapping dictionary for common calisthenics exercises.
 * Maps exercise names or partial matches to anatomical muscles
 * supported by react-body-highlighter.
 */

export type AnatomicalMuscle = 
  | "trapezius" | "upper-back" | "lower-back" | "chest" 
  | "biceps" | "triceps" | "forearm" | "back-deltoids" 
  | "front-deltoids" | "abs" | "obliques" | "adductor" 
  | "abductors" | "hamstring" | "quadriceps" | "calves" 
  | "gluteal" | "head" | "neck" | "knees" | "left-soleus" | "right-soleus";

export const EXERCISE_MUSCLE_MAP: Record<string, AnatomicalMuscle[]> = {
  // Pushing
  "Standard Push-Up": ["chest", "triceps", "front-deltoids"],
  "Push-Up": ["chest", "triceps", "front-deltoids"],
  "Wide Push-Up": ["chest", "front-deltoids"],
  "Incline Push-Up": ["chest", "triceps", "front-deltoids"],
  "Decline Push-Up": ["chest", "triceps", "front-deltoids"],
  "Diamond Push-Up": ["chest", "triceps"],
  "Pseudo Planche Push-Up": ["front-deltoids", "chest", "triceps"],
  "Planche Lean": ["front-deltoids", "triceps", "forearm"],
  "Planche": ["front-deltoids", "triceps", "forearm", "chest", "abs"],
  "Bench Dip": ["triceps", "chest", "front-deltoids"],
  "Parallel Bar Dip": ["chest", "triceps", "front-deltoids"],
  "Straight Bar Dip": ["chest", "triceps", "front-deltoids"],
  "Wall Push-Up": ["chest", "triceps", "front-deltoids"],
  "Knee Push-Up": ["chest", "triceps", "front-deltoids"],
  "Negative Push-Up": ["chest", "triceps", "front-deltoids"],
  "Pike Push-Up": ["front-deltoids", "triceps", "upper-back"],
  "Handstand": ["front-deltoids", "triceps", "trapezius"],
  "Handstand Push-Up": ["front-deltoids", "triceps", "trapezius"],

  // Pulling
  "Passive Dead Hang": ["forearm", "upper-back", "lower-back"],
  "Active Hang": ["upper-back", "trapezius", "forearm"],
  "Scapular Pull-Up": ["trapezius", "upper-back"],
  "Towel Hang": ["forearm", "biceps", "upper-back"],
  "Fingertip Hang Progression": ["forearm", "upper-back"],
  "Pull-Up Negative": ["upper-back", "biceps", "back-deltoids"],
  "Australian Pull-Up": ["upper-back", "biceps", "back-deltoids"],
  "Chin-Up": ["biceps", "upper-back", "back-deltoids"],
  "Pull-Up": ["upper-back", "biceps", "back-deltoids"],
  "Muscle-Up": ["upper-back", "biceps", "chest", "triceps"],
  "Front Lever": ["upper-back", "lower-back", "abs", "obliques", "triceps"],
  "Back Lever": ["lower-back", "upper-back", "chest", "front-deltoids", "biceps"],

  // Core
  "Plank": ["abs", "obliques", "lower-back"],
  "Side Plank": ["obliques", "abs"],
  "Hollow Body Hold": ["abs", "obliques"],
  "Hollow Hold": ["abs", "obliques"],
  "Arch Body Hold": ["lower-back", "gluteal"],
  "L-Sit": ["abs", "quadriceps", "triceps"],
  "Lying Leg Raise": ["abs"],
  "Dead Bug": ["abs", "obliques"],
  "Reverse Crunch": ["abs"],
  "Tuck Hold": ["abs", "triceps", "front-deltoids"],
  "Human Flag": ["obliques", "abs", "lower-back", "front-deltoids", "upper-back"],

  // Legs
  "Bodyweight Squat": ["quadriceps", "gluteal", "hamstring"],
  "Deep Squat Hold": ["quadriceps", "gluteal"],
  "Walking Lunge": ["quadriceps", "gluteal", "hamstring"],
  "Reverse Lunge": ["quadriceps", "gluteal", "hamstring"],
  "Bulgarian Split Squat": ["quadriceps", "gluteal", "hamstring"],
  "Pistol Squat": ["quadriceps", "gluteal", "hamstring", "calves"],
  "Shrimp Squat": ["quadriceps", "gluteal", "hamstring"],
  "Calf Raise": ["calves"],
};

/**
 * Given an exercise name, attempts to find the associated anatomical muscles.
 * Does a direct match first, then partial matching.
 */
export function getAnatomicalMusclesForExercise(exerciseName: string): AnatomicalMuscle[] {
  const normalized = exerciseName.trim().toLowerCase();
  
  // 1. Direct match (case insensitive)
  const directMatch = Object.keys(EXERCISE_MUSCLE_MAP).find(
    (k) => k.toLowerCase() === normalized
  );
  if (directMatch) return EXERCISE_MUSCLE_MAP[directMatch];

  // 2. Partial match
  for (const [key, groups] of Object.entries(EXERCISE_MUSCLE_MAP)) {
    if (normalized.includes(key.toLowerCase())) {
      return groups;
    }
  }

  // 3. Keyword fallback
  if (normalized.includes("push") || normalized.includes("dip")) return ["chest", "triceps", "front-deltoids"];
  if (normalized.includes("pull") || normalized.includes("chin") || normalized.includes("row")) return ["upper-back", "biceps", "back-deltoids"];
  if (normalized.includes("squat") || normalized.includes("lunge")) return ["quadriceps", "gluteal", "hamstring"];
  if (normalized.includes("plank") || normalized.includes("hold") || normalized.includes("raise")) return ["abs", "obliques"];
  if (normalized.includes("calf") || normalized.includes("calves")) return ["calves"];

  // Default fallback
  return [];
}
