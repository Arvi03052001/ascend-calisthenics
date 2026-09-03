export type RegressionOption = {
  name: string;
  type: "angle" | "eccentric" | "isometric";
  label: string;
  sets: string;
  target: string;
  equipment: string;
  notes: string;
  isTimeBased: boolean;
};

export type TriPhasicBridge = {
  exerciseName: string;
  category: string;
  rationale: string;
  options: {
    angle: RegressionOption;
    eccentric: RegressionOption;
    isometric: RegressionOption;
  };
};

export const SKILL_REGRESSIONS_DATABASE: Record<string, TriPhasicBridge> = {
  // --- VERTICAL PRESS (Pike & Handstand) ---
  "Pike Push-Up": {
    exerciseName: "Pike Push-Up",
    category: "Vertical Press / Shoulders",
    rationale: "Pike push-ups load 65–75% of your bodyweight directly on the anterior delts and triceps. If you cannot do 1 full rep on the floor, elevate hands to reduce load to ~45%, or use slow eccentrics to teach motor recruitment.",
    options: {
      angle: {
        name: "Hands-Elevated Pike Push-Up",
        type: "angle",
        label: "📐 Angle Shift (Full ROM)",
        sets: "3",
        target: "8 reps",
        equipment: "Bench or 18-24\" Box",
        notes: "Hands on bench, feet on floor. Maintain sharp V-shape, lower forehead forward past hands, press back.",
        isTimeBased: false,
      },
      eccentric: {
        name: "Pike Push-Up Negative",
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "4-5s slow lower (4 reps)",
        equipment: "Floor / Mat",
        notes: "From standard pike on floor, lower with a strict 4-5s count. Drop to knees once head touches, reset to top.",
        isTimeBased: false,
      },
      isometric: {
        name: "Pike Hold",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "20-30 sec",
        equipment: "Floor",
        notes: "Hold top pike position with elbows locked and shoulders pressed towards ears (active elevation).",
        isTimeBased: true,
      },
    },
  },

  "Handstand Push-Up": {
    exerciseName: "Handstand Push-Up",
    category: "Vertical Press / Shoulders",
    rationale: "Full handstand push-ups require pressing 90-100% of bodyweight. Regress to feet-elevated pike push-ups or chest-to-wall negatives.",
    options: {
      angle: {
        name: "Feet-Elevated Pike Push-Up",
        type: "angle",
        label: "📐 Angle Shift (High Leverage)",
        sets: "3",
        target: "8 reps",
        equipment: "Bench / Box",
        notes: "Feet on bench, hands on floor. Hips stacked vertically over shoulders.",
        isTimeBased: false,
      },
      eccentric: {
        name: "Wall Handstand Negative",
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "5s slow lower (3 reps)",
        equipment: "Wall",
        notes: "Kick up against wall, lower slowly with 5-second cadence until head touches floor mat.",
        isTimeBased: false,
      },
      isometric: {
        name: "Chest-to-Wall Handstand Hold",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "30-45 sec",
        equipment: "Wall",
        notes: "Wall climb into chest-to-wall handstand with toes pointed and shoulders pushed tall.",
        isTimeBased: true,
      },
    },
  },

  // --- HORIZONTAL PRESS (Push-Ups) ---
  "Standard Push-Up": {
    exerciseName: "Standard Push-Up",
    category: "Horizontal Press / Chest",
    rationale: "Standard push-ups require pushing ~64% of bodyweight. Incline or knee push-ups reduce the loaded mass to 35-50%, allowing full-depth chest contractions.",
    options: {
      angle: {
        name: "Incline Push-Up",
        type: "angle",
        label: "📐 Angle Shift (Elevated Hands)",
        sets: "3",
        target: "10-12 reps",
        equipment: "Bench or Bar",
        notes: "Hands elevated on sturdy bench or bar. Full chest-to-edge touch with tight core.",
        isTimeBased: false,
      },
      eccentric: {
        name: "Negative Push-Up",
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "5s tempo down (6 reps)",
        equipment: "Floor",
        notes: "From standard high plank, lower body in 5 seconds without sagging hips. Reset on knees.",
        isTimeBased: false,
      },
      isometric: {
        name: "Plank Bottom Hold",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "15-20 sec",
        equipment: "Floor",
        notes: "Hover 2 inches off floor with elbows at 45 degrees. Solid shoulder and pec tension.",
        isTimeBased: true,
      },
    },
  },

  "Wide Push-Up": {
    exerciseName: "Wide Push-Up",
    category: "Horizontal Press / Chest",
    rationale: "Wide hand placement increases chest stretch and anterior delt torque. Regress to wide incline push-ups to preserve the chest activation vector.",
    options: {
      angle: {
        name: "Wide Incline Push-Up",
        type: "angle",
        label: "📐 Angle Shift (Elevated Hands)",
        sets: "3",
        target: "10 reps",
        equipment: "Bench",
        notes: "Hands 1.5x shoulder width on bench. Flare chest open at bottom.",
        isTimeBased: false,
      },
      eccentric: {
        name: "Wide Negative Push-Up",
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "4s slow lower (5 reps)",
        equipment: "Floor",
        notes: "Wide stance lowering slowly to floor.",
        isTimeBased: false,
      },
      isometric: {
        name: "Knee Wide Push-Up Hold",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "20 sec hold",
        equipment: "Floor",
        notes: "Hold midpoint with knees on mat and wide hand placement.",
        isTimeBased: true,
      },
    },
  },

  // --- DIPS (Triceps & Lower Pecs) ---
  "Parallel Bar Dip": {
    exerciseName: "Parallel Bar Dip",
    category: "Tricep & Chest Push",
    rationale: "Parallel bar dips demand pressing 100% of bodyweight through shoulder extension. Bench dips or band-assisted dips keep elbows safe while building the lockout base.",
    options: {
      angle: {
        name: "Bench Dip",
        type: "angle",
        label: "📐 Angle Shift (Bench Dips)",
        sets: "3",
        target: "12 reps",
        equipment: "Bench",
        notes: "Hands on bench, feet flat on floor with knees bent at 90 degrees. Lower until upper arms are parallel.",
        isTimeBased: false,
      },
      eccentric: {
        name: "Negative Bar Dip",
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "4s slow lower (5 reps)",
        equipment: "Parallel Bars",
        notes: "Step or jump to top lockout on parallel bars. Lower in 4 seconds under control, then step back up.",
        isTimeBased: false,
      },
      isometric: {
        name: "Parallel Bar Support Hold",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "25-30 sec",
        equipment: "Parallel Bars",
        notes: "Lock out arms at top of dip bars with depressed scapula and chest proud.",
        isTimeBased: true,
      },
    },
  },

  "Bench Dip": {
    exerciseName: "Bench Dip",
    category: "Tricep & Chest Push",
    rationale: "If elevated bench dips cause elbow or shoulder discomfort, bend knees with feet closer to torso or use a floor seated tricep press.",
    options: {
      angle: {
        name: "Bent-Knee Bench Dip",
        type: "angle",
        label: "📐 Angle Shift (Knees Bent 90°)",
        sets: "3",
        target: "12-15 reps",
        equipment: "Bench / Chair",
        notes: "Bring feet closer to shift load from shoulders to legs as needed.",
        isTimeBased: false,
      },
      eccentric: {
        name: "Bench Dip Negative",
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "5s slow lower (6 reps)",
        equipment: "Bench",
        notes: "Slow descent down to 90 degrees at elbows.",
        isTimeBased: false,
      },
      isometric: {
        name: "Bench Dip Bottom Hold",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "15-20 sec",
        equipment: "Bench",
        notes: "Hold at bottom 90-degree position with chest tall.",
        isTimeBased: true,
      },
    },
  },

  // --- VERTICAL PULL (Pull-Ups & Chins) ---
  "Pull-Up": {
    exerciseName: "Pull-Up",
    category: "Vertical Pull / Lats",
    rationale: "Full dead-stop pull-ups require lifting 100% of body mass from full humeral extension. Australian horizontal rows or eccentric negatives bridge the gap fastest.",
    options: {
      angle: {
        name: "Australian Row",
        type: "angle",
        label: "📐 Angle Shift (Horizontal Pull)",
        sets: "3",
        target: "10-12 reps",
        equipment: "Low Bar or Rings",
        notes: "Heels on ground, body in straight line. Pull chest directly to bar with retracted shoulder blades.",
        isTimeBased: false,
      },
      eccentric: {
        name: "Negative Pull-Up",
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "5s slow lower (4 reps)",
        equipment: "Pull-Up Bar + Box",
        notes: "Jump or step up so chin is over bar. Control lowering over 5 full seconds to dead hang.",
        isTimeBased: false,
      },
      isometric: {
        name: "Active Hang",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "30-40 sec",
        equipment: "Pull-Up Bar",
        notes: "Hang from bar and actively pull shoulder blades down and back without bending elbows.",
        isTimeBased: true,
      },
    },
  },

  "Scapular Pull-Up": {
    exerciseName: "Scapular Pull-Up",
    category: "Grip & Scapular Depression",
    rationale: "If pulling the scapulae from a full dead hang is too demanding, reduce the hang intensity with toe assistance on a box.",
    options: {
      angle: {
        name: "Toe-Assisted Scapular Pull-Up",
        type: "angle",
        label: "📐 Angle Shift (Toe Assisted)",
        sets: "3",
        target: "10-12 reps",
        equipment: "Pull-Up Bar + Box",
        notes: "Rest tips of toes on a box beneath the bar to unweight 15-25% of bodyweight.",
        isTimeBased: false,
      },
      eccentric: {
        name: "Scapular Depression Negative",
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "4s slow release (6 reps)",
        equipment: "Pull-Up Bar",
        notes: "Shrug down aggressively, then release slowly over 4 seconds.",
        isTimeBased: false,
      },
      isometric: {
        name: "Active Scapular Hold",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "20-25 sec",
        equipment: "Pull-Up Bar",
        notes: "Hold locked scapular depression continuously.",
        isTimeBased: true,
      },
    },
  },

  // --- LOWER BODY ---
  "Bulgarian Split Squat": {
    exerciseName: "Bulgarian Split Squat",
    category: "Single-Leg Quad & Glute",
    rationale: "Bulgarian split squats demand unilateral hip stability and quad drive. Supported split squats or reverse lunges train the exact same knee-flexion mechanics with greater base of support.",
    options: {
      angle: {
        name: "Reverse Lunge",
        type: "angle",
        label: "📐 Angle Shift (Dual Foot Support)",
        sets: "3",
        target: "10-12 reps/leg",
        equipment: "Bodyweight",
        notes: "Step backward into lunge with front shin vertical. Push through front heel to return.",
        isTimeBased: false,
      },
      eccentric: {
        name: "Split Squat Negative",
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "4s tempo lower (6 reps/leg)",
        equipment: "Bench or Floor",
        notes: "Take 4 slow seconds descending until rear knee lightly brushes the floor.",
        isTimeBased: false,
      },
      isometric: {
        name: "Deep Split Squat Hold",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "25 sec/leg",
        equipment: "Bodyweight",
        notes: "Hover rear knee 1 inch off floor with front thigh parallel to ground.",
        isTimeBased: true,
      },
    },
  },

  "Bodyweight Squat": {
    exerciseName: "Bodyweight Squat",
    category: "Legs & Hip Mobility",
    rationale: "If full depth squats cause knee pain or heel lift, box squats or pole-assisted squats allow deep hip flexion without losing balance.",
    options: {
      angle: {
        name: "Box Squat",
        type: "angle",
        label: "📐 Angle Shift (Target Height)",
        sets: "3",
        target: "15 reps",
        equipment: "Bench or Chair",
        notes: "Squat down until hips lightly touch bench, pause 1 second without rocking, drive up.",
        isTimeBased: false,
      },
      eccentric: {
        name: "Slow Tempo Squat Negative",
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "5s slow lower (8 reps)",
        equipment: "Bodyweight",
        notes: "5 seconds down with weight balanced mid-foot, stand up explosively.",
        isTimeBased: false,
      },
      isometric: {
        name: "Deep Squat Hold",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "45-60 sec",
        equipment: "Bodyweight",
        notes: "Rest at bottom of squat with chest upright, opening hips with elbows.",
        isTimeBased: true,
      },
    },
  },

  // --- CORE & COMPRESSION ---
  "L-Sit": {
    exerciseName: "L-Sit",
    category: "Core Compression & Tricep Support",
    rationale: "L-Sits require immense hamstring flexibility, hip flexor compression, and scapular depression. Tucking the knees shortens the lever arm drastically.",
    options: {
      angle: {
        name: "Tuck L-Sit",
        type: "angle",
        label: "📐 Angle Shift (Knees to Chest)",
        sets: "3",
        target: "15-20 sec",
        equipment: "Parallettes or Floor",
        notes: "Knees tucked into chest, press shoulders down hard to elevate hips off floor.",
        isTimeBased: true,
      },
      eccentric: {
        name: "Lying Leg Raise Negative",
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "5s slow lower (8 reps)",
        equipment: "Floor / Mat",
        notes: "Raise legs to 90 degrees, lower slowly over 5 seconds keeping lower back glued to floor.",
        isTimeBased: false,
      },
      isometric: {
        name: "Tuck Hold",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "25 sec",
        equipment: "Parallettes / Bench",
        notes: "Hold tuck with feet off floor and elbows completely locked.",
        isTimeBased: true,
      },
    },
  },

  "Hollow Body Hold": {
    exerciseName: "Hollow Body Hold",
    category: "Core Posterior Pelvic Tilt",
    rationale: "If lower back arches off floor, the lever is too long. Bend knees or tuck arms forward to maintain true lumbar contact.",
    options: {
      angle: {
        name: "Bent-Knee Hollow Hold",
        type: "angle",
        label: "📐 Angle Shift (Bent Knees)",
        sets: "3",
        target: "30 sec",
        equipment: "Floor / Mat",
        notes: "Knees bent at 90 degrees, arms reaching forward past hips. Lower back pressed flat.",
        isTimeBased: true,
      },
      eccentric: {
        name: "Dead Bug",
        type: "eccentric",
        label: "⚡ Alternating Eccentric (Controlled)",
        sets: "3",
        target: "12 reps/side",
        equipment: "Floor",
        notes: "Lower opposite arm and leg slowly while keeping lower back locked to floor.",
        isTimeBased: false,
      },
      isometric: {
        name: "Tuck Hollow Hold",
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "35-40 sec",
        equipment: "Floor",
        notes: "Shoulder blades off floor, knees pulled close to chest.",
        isTimeBased: true,
      },
    },
  },
};

/**
 * Finds the calibrated Tri-Phasic Motor Bridge for any given exercise name.
 * Uses exact match first, then normalized partial keyword matching,
 * with an intelligent fallback if an unknown exercise is queried.
 */
export function getSkillRegression(exerciseName: string): TriPhasicBridge {
  const normalized = exerciseName.trim().toLowerCase();

  // 1. Direct match
  for (const [key, bridge] of Object.entries(SKILL_REGRESSIONS_DATABASE)) {
    if (key.toLowerCase() === normalized) return bridge;
  }

  // 2. Partial match
  for (const [key, bridge] of Object.entries(SKILL_REGRESSIONS_DATABASE)) {
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return bridge;
    }
  }

  // 3. Keyword-based matching
  if (normalized.includes("pike") || normalized.includes("handstand") || normalized.includes("overhead")) {
    return SKILL_REGRESSIONS_DATABASE["Pike Push-Up"];
  }
  if (normalized.includes("dip")) {
    return SKILL_REGRESSIONS_DATABASE["Parallel Bar Dip"];
  }
  if (normalized.includes("pull") || normalized.includes("chin") || normalized.includes("lat")) {
    return SKILL_REGRESSIONS_DATABASE["Pull-Up"];
  }
  if (normalized.includes("push") || normalized.includes("press")) {
    return SKILL_REGRESSIONS_DATABASE["Standard Push-Up"];
  }
  if (normalized.includes("squat") || normalized.includes("lunge")) {
    return SKILL_REGRESSIONS_DATABASE["Bulgarian Split Squat"];
  }
  if (normalized.includes("l-sit") || normalized.includes("tuck") || normalized.includes("leg raise")) {
    return SKILL_REGRESSIONS_DATABASE["L-Sit"];
  }
  if (normalized.includes("hollow") || normalized.includes("plank") || normalized.includes("core")) {
    return SKILL_REGRESSIONS_DATABASE["Hollow Body Hold"];
  }

  // 4. Default Dynamic Fallback
  return {
    exerciseName,
    category: "General Calisthenics",
    rationale: `When ${exerciseName} is too demanding, use the Tri-Phasic Bridge to train the movement pattern with elevated hands, slow negatives, or isometric holds.`,
    options: {
      angle: {
        name: `Elevated ${exerciseName}`,
        type: "angle",
        label: "📐 Angle Shift (Elevated Hands)",
        sets: "3",
        target: "8-10 reps",
        equipment: "Bench or Elevated Surface",
        notes: `Perform ${exerciseName} with elevated hands to decrease load by ~30-40%.`,
        isTimeBased: false,
      },
      eccentric: {
        name: `${exerciseName} Negative`,
        type: "eccentric",
        label: "⚡ Eccentric Overload (Negatives)",
        sets: "3",
        target: "4s slow lower (5 reps)",
        equipment: "Bodyweight",
        notes: "Focus solely on a controlled 4-5 second descent to build motor unit recruitment.",
        isTimeBased: false,
      },
      isometric: {
        name: `${exerciseName} Static Hold`,
        type: "isometric",
        label: "🛡️ Isometric Lock (Joint Capacity)",
        sets: "3",
        target: "20-25 sec",
        equipment: "Bodyweight",
        notes: "Hold the peak contraction or mid-range position with strict form.",
        isTimeBased: true,
      },
    },
  };
}
