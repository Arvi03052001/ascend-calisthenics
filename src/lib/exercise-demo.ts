// src/lib/exercise-demo.ts

export interface ExerciseDemoResult {
  found: boolean;
  dbName: string | null;
  name: string;
  level: string;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  imageUrls: string[];
  hasCustomAnimation: boolean;
  customAnimationKey: string | null;
  youtubeQuery: string;
}

const GITHUB_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

const CUSTOM_OVERRIDES: Record<string, Partial<ExerciseDemoResult>> = {
  "pike push-up": {
    name: "Pike Push-Up", level: "Intermediate", equipment: "Body Only",
    primaryMuscles: ["Anterior Deltoid", "Triceps Brachii"],
    secondaryMuscles: ["Core", "Serratus Anterior", "Upper Trapezius"],
    instructions: [
      "Start in a Downward Dog position - hips high, hands just wider than shoulders, feet hip-width. Form an inverted V.",
      "Bend your elbows and lower your head toward the floor between your hands. Keep hips elevated throughout.",
      "Lower until your head nearly touches the floor or elbows reach 90 degrees.",
      "Press explosively upward, straightening your arms fully back to the starting inverted-V position.",
      "Keep your core tight throughout. Avoid letting the hips drop.",
    ],
    hasCustomAnimation: true, customAnimationKey: "pike-push-up",
  },
  "hands-elevated pike push-up": {
    name: "Hands-Elevated Pike Push-Up", level: "Beginner", equipment: "Box or Bench",
    primaryMuscles: ["Anterior Deltoid", "Triceps Brachii"],
    secondaryMuscles: ["Core", "Serratus Anterior"],
    instructions: [
      "Place your hands on an elevated surface slightly wider than shoulder-width.",
      "Walk your feet close to the box so your hips are elevated in a pike position.",
      "Bend your elbows and lower your head toward the box surface in a vertical pressing motion.",
      "Press back up explosively to the start.",
      "As this gets easy, lower the box height to progress toward a full Pike Push-Up.",
    ],
    hasCustomAnimation: true, customAnimationKey: "pike-push-up",
  },
  "pike push-up negative": {
    name: "Pike Push-Up Negative", level: "Beginner-Intermediate", equipment: "Body Only",
    primaryMuscles: ["Anterior Deltoid", "Triceps Brachii"],
    secondaryMuscles: ["Core", "Serratus Anterior"],
    instructions: [
      "Start at the top of the Pike Push-Up with arms fully extended.",
      "Lower extremely slowly over 4 to 5 full seconds from top to bottom.",
      "At the bottom, place your knees down to rest and step back to the starting position.",
      "This exploits the eccentric strength advantage.",
      "Focus on keeping hips high throughout the descent.",
    ],
    hasCustomAnimation: true, customAnimationKey: "pike-push-up",
  },
  "pike hold": {
    name: "Pike Hold", level: "Beginner", equipment: "Body Only",
    primaryMuscles: ["Anterior Deltoid", "Core"],
    secondaryMuscles: ["Triceps Brachii", "Hip Flexors"],
    instructions: [
      "Begin in a Downward Dog position with hips high and arms fully extended.",
      "Lock your arms out hard - actively push the floor away to protract your shoulder blades.",
      "Hold the position for the target duration, maintaining full tension.",
      "Breathe short and controlled. Elbows must stay locked throughout.",
      "This conditions the tendons and joints for the full Pike Push-Up movement.",
    ],
    hasCustomAnimation: true, customAnimationKey: "pike-push-up",
  },
  "l-sit": {
    name: "L-Sit", level: "Advanced", equipment: "Parallel Bars or Floor",
    primaryMuscles: ["Hip Flexors", "Rectus Abdominis"],
    secondaryMuscles: ["Triceps Brachii", "Anterior Deltoid", "Quadriceps"],
    instructions: [
      "Sit on the floor with legs fully extended. Place hands beside your hips on the floor.",
      "Depress your shoulders - push them away from your ears and lock your elbows straight.",
      "Press through your hands and lift your hips AND legs off the floor simultaneously.",
      "Hold your legs parallel to the floor making an L shape with your torso.",
      "Hold for the target duration. Every second builds extreme compression strength.",
    ],
    hasCustomAnimation: true, customAnimationKey: "l-sit",
  },
  "hollow body hold": {
    name: "Hollow Body Hold", level: "Intermediate", equipment: "Body Only",
    primaryMuscles: ["Rectus Abdominis", "Transverse Abdominis"],
    secondaryMuscles: ["Hip Flexors", "Serratus Anterior", "Obliques"],
    instructions: [
      "Lie flat on your back. Press your entire lower back into the floor.",
      "Lift arms overhead, keeping them by your ears. Lift your head and shoulders off the floor.",
      "Raise your legs to 30-45 degrees off the floor while maintaining lower back contact.",
      "Hold the banana shape maintained by spinal flexion, not hip flexion.",
      "Breathe short controlled breaths without losing the hollow. Work up to 30-60 second holds.",
    ],
    hasCustomAnimation: true, customAnimationKey: "hollow-body",
  },
  "standard push-up": {
    name: "Push-Up", level: "Beginner", equipment: "Body Only",
    primaryMuscles: ["Pectoralis Major", "Triceps Brachii"],
    secondaryMuscles: ["Anterior Deltoid", "Core", "Serratus Anterior"],
    instructions: [
      "Start in a high plank: hands just outside shoulder-width, body a straight line head to heels.",
      "Lower your chest to the floor by bending your elbows. Flare them 45 degrees from your body.",
      "Touch your chest, hips and thighs to the ground at the same time.",
      "Press explosively back to the start, fully locking out both elbows at the top.",
      "Keep your core braced and glutes squeezed throughout the entire set.",
    ],
    hasCustomAnimation: false, customAnimationKey: null,
  },
  "bulgarian split squat": {
    name: "Bulgarian Split Squat", level: "Intermediate", equipment: "Bench",
    primaryMuscles: ["Quadriceps", "Gluteus Maximus"],
    secondaryMuscles: ["Hamstrings", "Hip Flexors", "Core"],
    instructions: [
      "Stand facing away from a bench. Elevate one foot behind you on the bench surface.",
      "Step your front foot forward enough that when you descend your knee tracks over your toes.",
      "Lower your rear knee toward the floor by bending your front knee and hip.",
      "Descend until your front thigh is parallel to the floor.",
      "Drive through your front heel to rise. Keep torso upright.",
    ],
    hasCustomAnimation: false, customAnimationKey: null,
  },
  "negative pull-up": {
    name: "Negative Pull-Up", level: "Beginner-Intermediate", equipment: "Pull-Up Bar",
    primaryMuscles: ["Latissimus Dorsi", "Biceps Brachii"],
    secondaryMuscles: ["Rhomboids", "Core"],
    instructions: [
      "Jump or use a box to get your chin above the bar in the top position.",
      "From the top, slowly lower yourself over 4 to 5 seconds, resisting gravity.",
      "Fully extend your arms at the bottom into a full dead hang.",
      "Jump back to the top and repeat.",
      "Focus on keeping your lats engaged throughout the descent.",
    ],
    hasCustomAnimation: false, customAnimationKey: null,
  },
  "australian row": {
    name: "Australian Row (Inverted Row)", level: "Beginner", equipment: "Low Bar or Rings",
    primaryMuscles: ["Latissimus Dorsi", "Rhomboids"],
    secondaryMuscles: ["Biceps Brachii", "Core", "Rear Deltoid"],
    instructions: [
      "Set a bar at waist height or use gymnastic rings. Grip overhand, slightly wider than shoulders.",
      "Walk feet forward and hang beneath the bar with body in a straight line facing up.",
      "Pull your chest up to the bar by retracting your shoulder blades and bending your elbows.",
      "Lower under control. The more horizontal your body, the harder the exercise.",
      "To progress: raise your feet on a box, or use a weighted vest.",
    ],
    hasCustomAnimation: false, customAnimationKey: null,
  },
};

interface DbExercise {
  name: string;
  id: string;
  level: string;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[];
}

let _db: DbExercise[] | null = null;
function getDb(): DbExercise[] {
  if (!_db) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _db = require("@/data/exercises.json") as DbExercise[];
  }
  return _db;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function findInDb(name: string): DbExercise | null {
  const db = getDb();
  const q = normalize(name);
  let match = db.find((e) => normalize(e.name) === q);
  if (match) return match;
  match = db.find((e) => normalize(e.name).includes(q));
  if (match) return match;
  match = db.find((e) => q.includes(normalize(e.name)));
  if (match) return match;
  const qWords = new Set(q.split(" ").filter((w) => w.length > 2));
  let bestScore = 0;
  let bestMatch: DbExercise | null = null;
  for (const e of db) {
    const eWords = normalize(e.name).split(" ").filter((w) => w.length > 2);
    const overlap = eWords.filter((w) => qWords.has(w)).length;
    if (overlap > bestScore) { bestScore = overlap; bestMatch = e; }
  }
  return bestScore >= 2 ? bestMatch : null;
}

export function getExerciseDemo(exerciseName: string): ExerciseDemoResult {
  const key = normalize(exerciseName);
  const youtubeQuery = "https://www.youtube.com/results?search_query=" + encodeURIComponent(exerciseName + " exercise form tutorial");
  const custom = CUSTOM_OVERRIDES[key];
  if (custom) {
    return {
      found: true, dbName: null,
      name: custom.name ?? exerciseName, level: custom.level ?? "Intermediate",
      equipment: custom.equipment ?? "Body Only",
      primaryMuscles: custom.primaryMuscles ?? [],
      secondaryMuscles: custom.secondaryMuscles ?? [],
      instructions: custom.instructions ?? [],
      imageUrls: [],
      hasCustomAnimation: custom.hasCustomAnimation ?? false,
      customAnimationKey: custom.customAnimationKey ?? null,
      youtubeQuery,
    };
  }
  const dbEntry = findInDb(exerciseName);
  if (dbEntry) {
    const imageUrls = dbEntry.images.map((img) => GITHUB_BASE + "/" + img);
    return {
      found: true, dbName: dbEntry.name, name: exerciseName,
      level: capitalize(dbEntry.level),
      equipment: capitalize(dbEntry.equipment ?? "Body Only"),
      primaryMuscles: dbEntry.primaryMuscles.map(capitalize),
      secondaryMuscles: dbEntry.secondaryMuscles.map(capitalize),
      instructions: dbEntry.instructions, imageUrls,
      hasCustomAnimation: false, customAnimationKey: null, youtubeQuery,
    };
  }
  return {
    found: false, dbName: null, name: exerciseName, level: "Intermediate",
    equipment: "Body Only", primaryMuscles: [], secondaryMuscles: [],
    instructions: [], imageUrls: [],
    hasCustomAnimation: false, customAnimationKey: null, youtubeQuery,
  };
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
