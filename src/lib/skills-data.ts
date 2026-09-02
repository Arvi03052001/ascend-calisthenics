export type SkillTier = "Foundation" | "Beginner" | "Intermediate" | "Advanced" | "Elite";

export type SkillCategory =
  | "Hanging/Grip" | "Pushing" | "Pulling" | "Core" | "Legs" | "Mobility"
  | "Arm Balance" | "Handstand" | "Muscle-Up" | "Front Lever" | "Back Lever"
  | "Planche" | "Human Flag" | "Rings" | "One-Arm Strength" | "Extreme Combinations";

export type SkillDefinition = {
  num: number;
  id: string;
  name: string;
  tier: SkillTier;
  category: SkillCategory;
  targetMetric: string;
  targetNumeric: number;
  isTimeBased: boolean;
  notes?: string;
  isGateway?: boolean;
  exerciseMatch: string[];
};

export const SKILL_ROADMAP_161: SkillDefinition[] = [
  // 🟢 FOUNDATION (1 - 34) — 3x High-Volume & Endurance Mastery Targets
  { num: 1, id: "f_01", name: "Passive Dead Hang", tier: "Foundation", category: "Hanging/Grip", targetMetric: "180 sec", targetNumeric: 180, isTimeBased: true, isGateway: true, exerciseMatch: ["Passive Dead Hang", "Dead Hang"] },
  { num: 2, id: "f_02", name: "Active Hang", tier: "Foundation", category: "Hanging/Grip", targetMetric: "90 sec", targetNumeric: 90, isTimeBased: true, isGateway: true, exerciseMatch: ["Active Hang"] },
  { num: 3, id: "f_03", name: "Scapular Pull-Up", tier: "Foundation", category: "Hanging/Grip", targetMetric: "9 x 30", targetNumeric: 30, isTimeBased: false, isGateway: true, exerciseMatch: ["Scapular Pull-Up", "Scapular Control"] },
  { num: 4, id: "f_04", name: "Towel Hang", tier: "Foundation", category: "Hanging/Grip", targetMetric: "90 sec", targetNumeric: 90, isTimeBased: true, exerciseMatch: ["Towel Hang"] },
  { num: 5, id: "f_05", name: "Fingertip Hang Progression", tier: "Foundation", category: "Hanging/Grip", targetMetric: "45 sec", targetNumeric: 45, isTimeBased: true, exerciseMatch: ["Fingertip Hang"] },

  { num: 6, id: "f_06", name: "Wall Push-Up", tier: "Foundation", category: "Pushing", targetMetric: "9 x 45", targetNumeric: 45, isTimeBased: false, exerciseMatch: ["Wall Push-Up"] },
  { num: 7, id: "f_07", name: "Incline Push-Up", tier: "Foundation", category: "Pushing", targetMetric: "9 x 45", targetNumeric: 45, isTimeBased: false, exerciseMatch: ["Incline Push-Up"] },
  { num: 8, id: "f_08", name: "Knee Push-Up", tier: "Foundation", category: "Pushing", targetMetric: "9 x 36", targetNumeric: 36, isTimeBased: false, exerciseMatch: ["Knee Push-Up"] },
  { num: 9, id: "f_09", name: "Standard Push-Up", tier: "Foundation", category: "Pushing", targetMetric: "9 x 45", targetNumeric: 45, isTimeBased: false, isGateway: true, exerciseMatch: ["Standard Push-Up", "Push-Up"] },
  { num: 10, id: "f_10", name: "Negative Push-Up", tier: "Foundation", category: "Pushing", targetMetric: "9 x 24 (5s tempo)", targetNumeric: 24, isTimeBased: false, exerciseMatch: ["Negative Push-Up"] },
  { num: 11, id: "f_11", name: "Wide Push-Up", tier: "Foundation", category: "Pushing", targetMetric: "9 x 45", targetNumeric: 45, isTimeBased: false, exerciseMatch: ["Wide Push-Up"] },
  { num: 12, id: "f_12", name: "Bench Dip", tier: "Foundation", category: "Pushing", targetMetric: "9 x 45", targetNumeric: 45, isTimeBased: false, isGateway: true, exerciseMatch: ["Bench Dip"] },

  { num: 13, id: "f_13", name: "Plank", tier: "Foundation", category: "Core", targetMetric: "270 sec", targetNumeric: 270, isTimeBased: true, exerciseMatch: ["Plank"] },
  { num: 14, id: "f_14", name: "Side Plank", tier: "Foundation", category: "Core", targetMetric: "135 sec/side", targetNumeric: 135, isTimeBased: true, exerciseMatch: ["Side Plank"] },
  { num: 15, id: "f_15", name: "Hollow Body Hold", tier: "Foundation", category: "Core", targetMetric: "135 sec", targetNumeric: 135, isTimeBased: true, isGateway: true, exerciseMatch: ["Hollow Body Hold", "Hollow Hold"] },
  { num: 16, id: "f_16", name: "Arch Body Hold", tier: "Foundation", category: "Core", targetMetric: "135 sec", targetNumeric: 135, isTimeBased: true, exerciseMatch: ["Arch Body Hold"] },
  { num: 17, id: "f_17", name: "Dead Bug", tier: "Foundation", category: "Core", targetMetric: "9 x 36/side", targetNumeric: 36, isTimeBased: false, exerciseMatch: ["Dead Bug"] },
  { num: 18, id: "f_18", name: "Reverse Crunch", tier: "Foundation", category: "Core", targetMetric: "9 x 45", targetNumeric: 45, isTimeBased: false, exerciseMatch: ["Reverse Crunch"] },
  { num: 19, id: "f_19", name: "Lying Leg Raise", tier: "Foundation", category: "Core", targetMetric: "9 x 36", targetNumeric: 36, isTimeBased: false, isGateway: true, exerciseMatch: ["Lying Leg Raise"] },
  { num: 20, id: "f_20", name: "Tuck Hold", tier: "Foundation", category: "Core", targetMetric: "90 sec", targetNumeric: 90, isTimeBased: true, isGateway: true, exerciseMatch: ["Tuck Hold"] },

  { num: 21, id: "f_21", name: "Bodyweight Squat", tier: "Foundation", category: "Legs", targetMetric: "9 x 60", targetNumeric: 60, isTimeBased: false, isGateway: true, exerciseMatch: ["Bodyweight Squat", "Squat"] },
  { num: 22, id: "f_22", name: "Deep Squat Hold", tier: "Foundation", category: "Legs", targetMetric: "180 sec", targetNumeric: 180, isTimeBased: true, isGateway: true, exerciseMatch: ["Deep Squat Hold"] },
  { num: 23, id: "f_23", name: "Reverse Lunge", tier: "Foundation", category: "Legs", targetMetric: "9 x 36/leg", targetNumeric: 36, isTimeBased: false, exerciseMatch: ["Reverse Lunge"] },
  { num: 24, id: "f_24", name: "Walking Lunge", tier: "Foundation", category: "Legs", targetMetric: "9 x 36/leg", targetNumeric: 36, isTimeBased: false, exerciseMatch: ["Walking Lunge"] },
  { num: 25, id: "f_25", name: "Bulgarian Split Squat", tier: "Foundation", category: "Legs", targetMetric: "9 x 30/leg", targetNumeric: 30, isTimeBased: false, isGateway: true, exerciseMatch: ["Bulgarian Split Squat"] },
  { num: 26, id: "f_26", name: "Glute Bridge", tier: "Foundation", category: "Legs", targetMetric: "9 x 45", targetNumeric: 45, isTimeBased: false, exerciseMatch: ["Glute Bridge"] },
  { num: 27, id: "f_27", name: "Single-Leg Glute Bridge", tier: "Foundation", category: "Legs", targetMetric: "9 x 30/leg", targetNumeric: 30, isTimeBased: false, exerciseMatch: ["Single-Leg Glute Bridge"] },
  { num: 28, id: "f_28", name: "Standing Calf Raise", tier: "Foundation", category: "Legs", targetMetric: "9 x 60", targetNumeric: 60, isTimeBased: false, exerciseMatch: ["Standing Calf Raise"] },
  { num: 29, id: "f_29", name: "Wall Sit", tier: "Foundation", category: "Legs", targetMetric: "270 sec", targetNumeric: 270, isTimeBased: true, exerciseMatch: ["Wall Sit"] },

  { num: 30, id: "f_30", name: "Wrist Conditioning", tier: "Foundation", category: "Mobility", targetMetric: "6-9 min", targetNumeric: 360, isTimeBased: true, exerciseMatch: ["Wrist Conditioning"] },
  { num: 31, id: "f_31", name: "Shoulder Mobility", tier: "Foundation", category: "Mobility", targetMetric: "6-9 min", targetNumeric: 360, isTimeBased: true, exerciseMatch: ["Shoulder Mobility"] },
  { num: 32, id: "f_32", name: "Scapular Control", tier: "Foundation", category: "Mobility", targetMetric: "9 x 30", targetNumeric: 30, isTimeBased: false, exerciseMatch: ["Scapular Control"] },
  { num: 33, id: "f_33", name: "Ankle Mobility", tier: "Foundation", category: "Mobility", targetMetric: "6-9 min", targetNumeric: 360, isTimeBased: true, exerciseMatch: ["Ankle Mobility"] },
  { num: 34, id: "f_34", name: "Deep Squat Mobility", tier: "Foundation", category: "Mobility", targetMetric: "180 sec", targetNumeric: 180, isTimeBased: true, exerciseMatch: ["Deep Squat Mobility"] },

  // 🔵 BEGINNER (35 - 69)
  { num: 35, id: "b_35", name: "Australian Row", tier: "Beginner", category: "Pulling", targetMetric: "9 x 45", targetNumeric: 45, isTimeBased: false, exerciseMatch: ["Australian Row", "Inverted Row"] },
  { num: 36, id: "b_36", name: "Negative Chin-Up", tier: "Beginner", category: "Pulling", targetMetric: "9 x 15 (5-8s tempo)", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["Negative Chin-Up"] },
  { num: 37, id: "b_37", name: "Negative Pull-Up", tier: "Beginner", category: "Pulling", targetMetric: "9 x 15 (5-8s tempo)", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["Negative Pull-Up"] },
  { num: 38, id: "b_38", name: "Chin-Up", tier: "Beginner", category: "Pulling", targetMetric: "9 x 15", targetNumeric: 15, isTimeBased: false, isGateway: true, exerciseMatch: ["Chin-Up"] },
  { num: 39, id: "b_39", name: "Pull-Up", tier: "Beginner", category: "Pulling", targetMetric: "9 x 15", targetNumeric: 15, isTimeBased: false, isGateway: true, exerciseMatch: ["Pull-Up", "Standard Pull-Up"] },
  { num: 40, id: "b_40", name: "Neutral-Grip Pull-Up", tier: "Beginner", category: "Pulling", targetMetric: "9 x 15", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["Neutral-Grip Pull-Up"] },
  { num: 41, id: "b_41", name: "Commando Pull-Up", tier: "Beginner", category: "Pulling", targetMetric: "9 x 15/side", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["Commando Pull-Up"] },

  { num: 42, id: "b_42", name: "Diamond Push-Up", tier: "Beginner", category: "Pushing", targetMetric: "9 x 36", targetNumeric: 36, isTimeBased: false, exerciseMatch: ["Diamond Push-Up"] },
  { num: 43, id: "b_43", name: "Decline Push-Up", tier: "Beginner", category: "Pushing", targetMetric: "9 x 30", targetNumeric: 30, isTimeBased: false, exerciseMatch: ["Decline Push-Up"] },
  { num: 44, id: "b_44", name: "Pike Push-Up", tier: "Beginner", category: "Pushing", targetMetric: "9 x 30", targetNumeric: 30, isTimeBased: false, isGateway: true, exerciseMatch: ["Pike Push-Up"] },
  { num: 45, id: "b_45", name: "Archer Push-Up", tier: "Beginner", category: "Pushing", targetMetric: "9 x 15/side", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["Archer Push-Up"] },
  { num: 46, id: "b_46", name: "Pseudo Planche Push-Up", tier: "Beginner", category: "Pushing", targetMetric: "9 x 24", targetNumeric: 24, isTimeBased: false, exerciseMatch: ["Pseudo Planche Push-Up"] },
  { num: 47, id: "b_47", name: "Parallel Bar Dip", tier: "Beginner", category: "Pushing", targetMetric: "9 x 30", targetNumeric: 30, isTimeBased: false, isGateway: true, exerciseMatch: ["Parallel Bar Dip", "Dip"] },
  { num: 48, id: "b_48", name: "Straight Bar Dip", tier: "Beginner", category: "Pushing", targetMetric: "9 x 30", targetNumeric: 30, isTimeBased: false, exerciseMatch: ["Straight Bar Dip"] },

  { num: 49, id: "b_49", name: "Frog Stand", tier: "Beginner", category: "Arm Balance", targetMetric: "90 sec", targetNumeric: 90, isTimeBased: true, exerciseMatch: ["Frog Stand"] },
  { num: 50, id: "b_50", name: "Crow Stand", tier: "Beginner", category: "Arm Balance", targetMetric: "90 sec", targetNumeric: 90, isTimeBased: true, exerciseMatch: ["Crow Stand"] },
  { num: 51, id: "b_51", name: "Tuck Elbow Lever", tier: "Beginner", category: "Arm Balance", targetMetric: "60 sec", targetNumeric: 60, isTimeBased: true, exerciseMatch: ["Tuck Elbow Lever"] },
  { num: 52, id: "b_52", name: "Elbow Lever", tier: "Beginner", category: "Arm Balance", targetMetric: "90 sec", targetNumeric: 90, isTimeBased: true, isGateway: true, exerciseMatch: ["Elbow Lever"] },

  { num: 53, id: "b_53", name: "Hanging Knee Raise", tier: "Beginner", category: "Core", targetMetric: "9 x 36", targetNumeric: 36, isTimeBased: false, exerciseMatch: ["Hanging Knee Raise"] },
  { num: 54, id: "b_54", name: "Hanging Leg Raise", tier: "Beginner", category: "Core", targetMetric: "9 x 30", targetNumeric: 30, isTimeBased: false, isGateway: true, exerciseMatch: ["Hanging Leg Raise"] },
  { num: 55, id: "b_55", name: "Tuck L-Sit", tier: "Beginner", category: "Core", targetMetric: "90 sec", targetNumeric: 90, isTimeBased: true, exerciseMatch: ["Tuck L-Sit"] },
  { num: 56, id: "b_56", name: "L-Sit", tier: "Beginner", category: "Core", targetMetric: "60 sec", targetNumeric: 60, isTimeBased: true, isGateway: true, exerciseMatch: ["L-Sit"] },
  { num: 57, id: "b_57", name: "Hollow Rock", tier: "Beginner", category: "Core", targetMetric: "9 x 45", targetNumeric: 45, isTimeBased: false, exerciseMatch: ["Hollow Rock"] },
  { num: 58, id: "b_58", name: "Dragon Flag Negative", tier: "Beginner", category: "Core", targetMetric: "9 x 15", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["Dragon Flag Negative"] },

  { num: 59, id: "b_59", name: "Wall Handstand", tier: "Beginner", category: "Handstand", targetMetric: "180 sec", targetNumeric: 180, isTimeBased: true, exerciseMatch: ["Wall Handstand"] },
  { num: 60, id: "b_60", name: "Chest-to-Wall Handstand", tier: "Beginner", category: "Handstand", targetMetric: "180 sec", targetNumeric: 180, isTimeBased: true, isGateway: true, exerciseMatch: ["Chest-to-Wall Handstand"] },
  { num: 61, id: "b_61", name: "Wall Handstand Shoulder Tap", tier: "Beginner", category: "Handstand", targetMetric: "9 x 30/side", targetNumeric: 30, isTimeBased: false, exerciseMatch: ["Wall Handstand Shoulder Tap"] },

  { num: 62, id: "b_62", name: "Assisted Pistol Squat", tier: "Beginner", category: "Legs", targetMetric: "9 x 24/leg", targetNumeric: 24, isTimeBased: false, exerciseMatch: ["Assisted Pistol Squat"] },
  { num: 63, id: "b_63", name: "Pistol Squat Negative", tier: "Beginner", category: "Legs", targetMetric: "9 x 15/leg", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["Pistol Squat Negative"] },
  { num: 64, id: "b_64", name: "Shrimp Squat Progression", tier: "Beginner", category: "Legs", targetMetric: "9 x 24/leg", targetNumeric: 24, isTimeBased: false, exerciseMatch: ["Shrimp Squat Progression"] },
  { num: 65, id: "b_65", name: "Nordic Curl Negative", tier: "Beginner", category: "Legs", targetMetric: "9 x 15", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["Nordic Curl Negative"] },

  { num: 66, id: "b_66", name: "Tuck Back Lever", tier: "Beginner", category: "Back Lever", targetMetric: "60 sec", targetNumeric: 60, isTimeBased: true, isGateway: true, exerciseMatch: ["Tuck Back Lever"] },
  { num: 67, id: "b_67", name: "Tuck Front Lever", tier: "Beginner", category: "Front Lever", targetMetric: "60 sec", targetNumeric: 60, isTimeBased: true, isGateway: true, exerciseMatch: ["Tuck Front Lever"] },
  { num: 68, id: "b_68", name: "Skin-the-Cat", tier: "Beginner", category: "Core", targetMetric: "9 x 15", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["Skin-the-Cat"] },
  { num: 69, id: "b_69", name: "Tuck Human Flag", tier: "Beginner", category: "Human Flag", targetMetric: "30 sec", targetNumeric: 30, isTimeBased: true, exerciseMatch: ["Tuck Human Flag"] },

  // 🟠 INTERMEDIATE (70 - 109)
  { num: 70, id: "i_70", name: "Chest-to-Bar Pull-Up", tier: "Intermediate", category: "Pulling", targetMetric: "9 x 24", targetNumeric: 24, isTimeBased: false, isGateway: true, exerciseMatch: ["Chest-to-Bar Pull-Up"] },
  { num: 75, id: "i_75", name: "L-Sit Pull-Up", tier: "Intermediate", category: "Pulling", targetMetric: "9 x 15", targetNumeric: 15, isTimeBased: false, exerciseMatch: ["L-Sit Pull-Up"] },
  { num: 80, id: "i_80", name: "Bar Muscle-Up", tier: "Intermediate", category: "Muscle-Up", targetMetric: "9 clean reps", targetNumeric: 9, isTimeBased: false, isGateway: true, exerciseMatch: ["Bar Muscle-Up", "Muscle-Up"] },
  { num: 81, id: "i_81", name: "Advanced Tuck Front Lever", tier: "Intermediate", category: "Front Lever", targetMetric: "60 sec", targetNumeric: 60, isTimeBased: true, isGateway: true, exerciseMatch: ["Advanced Tuck Front Lever"] },
  { num: 87, id: "i_87", name: "Full Back Lever", tier: "Intermediate", category: "Back Lever", targetMetric: "45-60 sec", targetNumeric: 60, isTimeBased: true, isGateway: true, exerciseMatch: ["Full Back Lever", "Back Lever"] },
  { num: 89, id: "i_89", name: "Wall Handstand Push-Up", tier: "Intermediate", category: "Pushing", targetMetric: "9 x 24", targetNumeric: 24, isTimeBased: false, isGateway: true, exerciseMatch: ["Wall Handstand Push-Up", "Wall HSPU"] },
  { num: 91, id: "i_91", name: "Tuck Planche", tier: "Intermediate", category: "Planche", targetMetric: "45-60 sec", targetNumeric: 60, isTimeBased: true, isGateway: true, exerciseMatch: ["Tuck Planche"] },
  { num: 101, id: "i_101", name: "Freestanding Handstand", tier: "Intermediate", category: "Handstand", targetMetric: "90 sec", targetNumeric: 90, isTimeBased: true, isGateway: true, exerciseMatch: ["Freestanding Handstand", "Handstand"] },
  { num: 104, id: "i_104", name: "Tuck Human Flag Progression", tier: "Intermediate", category: "Human Flag", targetMetric: "30-45 sec", targetNumeric: 45, isTimeBased: true, isGateway: true, exerciseMatch: ["Human Flag"] },
  { num: 107, id: "i_107", name: "Full Pistol Squat", tier: "Intermediate", category: "Legs", targetMetric: "9 x 24/leg", targetNumeric: 24, isTimeBased: false, isGateway: true, exerciseMatch: ["Full Pistol Squat", "Pistol Squat"] },

  // 🔴 ADVANCED (110 - 134)
  { num: 110, id: "a_110", name: "Full Front Lever", tier: "Advanced", category: "Front Lever", targetMetric: "30-45 sec", targetNumeric: 45, isTimeBased: true, isGateway: true, exerciseMatch: ["Full Front Lever", "Front Lever"] },
  { num: 111, id: "a_111", name: "Front Lever Pull-Up", tier: "Advanced", category: "Front Lever", targetMetric: "9-15 reps", targetNumeric: 15, isTimeBased: false, isGateway: true, exerciseMatch: ["Front Lever Pull-Up"] },
  { num: 113, id: "a_113", name: "Straddle Planche", tier: "Advanced", category: "Planche", targetMetric: "24-36 sec", targetNumeric: 30, isTimeBased: true, isGateway: true, exerciseMatch: ["Straddle Planche"] },
  { num: 118, id: "a_118", name: "Freestanding Handstand Push-Up", tier: "Advanced", category: "Handstand", targetMetric: "3 clean reps", targetNumeric: 3, isTimeBased: false, isGateway: true, exerciseMatch: ["Freestanding Handstand Push-Up", "Freestanding HSPU"] },
  { num: 119, id: "a_119", name: "Strict Handstand Push-Up", tier: "Advanced", category: "Handstand", targetMetric: "15-24 reps", targetNumeric: 24, isTimeBased: false, isGateway: true, exerciseMatch: ["Strict Handstand Push-Up", "Strict HSPU"] },
  { num: 124, id: "a_124", name: "Full Human Flag", tier: "Advanced", category: "Human Flag", targetMetric: "30-45 sec", targetNumeric: 45, isTimeBased: true, isGateway: true, exerciseMatch: ["Full Human Flag"] },
  { num: 133, id: "a_133", name: "Ring Muscle-Up", tier: "Advanced", category: "Rings", targetMetric: "9 clean reps", targetNumeric: 9, isTimeBased: false, isGateway: true, exerciseMatch: ["Ring Muscle-Up"] },

  // 🟣 ELITE (135 - 161)
  { num: 135, id: "e_135", name: "Full Planche", tier: "Elite", category: "Planche", targetMetric: "30-45 sec", targetNumeric: 45, isTimeBased: true, exerciseMatch: ["Full Planche"] },
  { num: 142, id: "e_142", name: "One-Arm Pull-Up", tier: "Elite", category: "One-Arm Strength", targetMetric: "3-9 clean reps/arm", targetNumeric: 9, isTimeBased: false, exerciseMatch: ["One-Arm Pull-Up"] },
  { num: 145, id: "e_145", name: "One-Arm Handstand", tier: "Elite", category: "Handstand", targetMetric: "30-60 sec", targetNumeric: 60, isTimeBased: true, exerciseMatch: ["One-Arm Handstand"] },
  { num: 154, id: "e_154", name: "Iron Cross", tier: "Elite", category: "Rings", targetMetric: "30-45 sec", targetNumeric: 45, isTimeBased: true, exerciseMatch: ["Iron Cross"] },
  { num: 156, id: "e_156", name: "Maltese", tier: "Elite", category: "Rings", targetMetric: "15-30 sec", targetNumeric: 30, isTimeBased: true, exerciseMatch: ["Maltese"] },
];
