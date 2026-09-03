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
  "Hands-Elevated Pike Push-Up": ["front-deltoids", "triceps", "upper-back"],
  "Pike Push-Up Negative": ["front-deltoids", "triceps", "upper-back"],
  "Pike Hold": ["front-deltoids", "triceps", "upper-back"],
  "Feet-Elevated Pike Push-Up": ["front-deltoids", "triceps", "upper-back"],
  "Handstand": ["front-deltoids", "triceps", "trapezius"],
  "Handstand Push-Up": ["front-deltoids", "triceps", "trapezius"],
  "Wall Handstand Negative": ["front-deltoids", "triceps", "trapezius"],
  "Chest-to-Wall Handstand Hold": ["front-deltoids", "triceps", "trapezius"],
  "Wide Incline Push-Up": ["chest", "front-deltoids"],
  "Wide Negative Push-Up": ["chest", "front-deltoids"],
  "Knee Wide Push-Up Hold": ["chest", "front-deltoids"],
  "Bent-Knee Bench Dip": ["triceps", "chest", "front-deltoids"],
  "Negative Bar Dip": ["chest", "triceps", "front-deltoids"],
  "Bench Dip Negative": ["triceps", "chest", "front-deltoids"],
  "Parallel Bar Support Hold": ["chest", "triceps", "front-deltoids"],
  "Bench Dip Bottom Hold": ["triceps", "chest", "front-deltoids"],
  "Plank Bottom Hold": ["abs", "chest", "triceps"],

  // Pulling
  "Passive Dead Hang": ["forearm", "upper-back", "lower-back"],
  "Active Hang": ["upper-back", "trapezius", "forearm"],
  "Scapular Pull-Up": ["trapezius", "upper-back"],
  "Toe-Assisted Scapular Pull-Up": ["trapezius", "upper-back"],
  "Scapular Depression Negative": ["trapezius", "upper-back"],
  "Active Scapular Hold": ["trapezius", "upper-back"],
  "Towel Hang": ["forearm", "biceps", "upper-back"],
  "Fingertip Hang Progression": ["forearm", "upper-back"],
  "Pull-Up Negative": ["upper-back", "biceps", "back-deltoids"],
  "Negative Pull-Up": ["upper-back", "biceps", "back-deltoids"],
  "Australian Pull-Up": ["upper-back", "biceps", "back-deltoids"],
  "Australian Row": ["upper-back", "biceps", "back-deltoids"],
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
  "Bent-Knee Hollow Hold": ["abs", "obliques"],
  "Tuck Hollow Hold": ["abs", "obliques"],
  "Arch Body Hold": ["lower-back", "gluteal"],
  "L-Sit": ["abs", "quadriceps", "triceps"],
  "Tuck L-Sit": ["abs", "quadriceps", "triceps"],
  "Lying Leg Raise": ["abs"],
  "Lying Leg Raise Negative": ["abs"],
  "Dead Bug": ["abs", "obliques"],
  "Reverse Crunch": ["abs"],
  "Tuck Hold": ["abs", "triceps", "front-deltoids"],
  "Human Flag": ["obliques", "abs", "lower-back", "front-deltoids", "upper-back"],

  // Legs
  "Bodyweight Squat": ["quadriceps", "gluteal", "hamstring"],
  "Box Squat": ["quadriceps", "gluteal", "hamstring"],
  "Slow Tempo Squat Negative": ["quadriceps", "gluteal", "hamstring"],
  "Deep Squat Hold": ["quadriceps", "gluteal"],
  "Walking Lunge": ["quadriceps", "gluteal", "hamstring"],
  "Reverse Lunge": ["quadriceps", "gluteal", "hamstring"],
  "Bulgarian Split Squat": ["quadriceps", "gluteal", "hamstring"],
  "Split Squat Negative": ["quadriceps", "gluteal", "hamstring"],
  "Deep Split Squat Hold": ["quadriceps", "gluteal", "hamstring"],
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
