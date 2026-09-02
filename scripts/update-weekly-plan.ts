import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating WeeklyPlan in Neon DB with 6-Day 1.5hr Pro Calisthenics Routine...");

  // Clear existing WeeklyPlan rows
  await prisma.weeklyPlan.deleteMany();

  const newPlan = [
    // Day 1: Monday — PUSH & CHEST MASTERY (1.5 Hours)
    { dayName: "Monday", dayNumber: 1, focus: "Push & Chest Endurance (1.5 Hours)", phase: "Warmup", orderInPhase: 1, exerciseName: "Wrist Conditioning", equipment: "Bodyweight", sets: "1", repsOrDuration: "6 min", rest: "30s", coachingNotes: "Prepare wrists for high push-up volume." },
    { dayName: "Monday", dayNumber: 1, focus: "Push & Chest Endurance (1.5 Hours)", phase: "Main Workout", orderInPhase: 1, exerciseName: "Standard Push-Up", equipment: "Bodyweight", sets: "9", repsOrDuration: "45 reps", rest: "90s", coachingNotes: "Chest to floor, clean lockout. Building toward 75+ continuous reps." },
    { dayName: "Monday", dayNumber: 1, focus: "Push & Chest Endurance (1.5 Hours)", phase: "Main Workout", orderInPhase: 2, exerciseName: "Incline Push-Up", equipment: "Bench / Elevated", sets: "9", repsOrDuration: "45 reps", rest: "60s", coachingNotes: "High-volume chest volume." },
    { dayName: "Monday", dayNumber: 1, focus: "Push & Chest Endurance (1.5 Hours)", phase: "Main Workout", orderInPhase: 3, exerciseName: "Knee Push-Up", equipment: "Bodyweight", sets: "9", repsOrDuration: "36 reps", rest: "60s", coachingNotes: "Burnout volume for chest & triceps." },
    { dayName: "Monday", dayNumber: 1, focus: "Push & Chest Endurance (1.5 Hours)", phase: "Main Workout", orderInPhase: 4, exerciseName: "Negative Push-Up", equipment: "Bodyweight", sets: "9", repsOrDuration: "24 reps", rest: "60s", coachingNotes: "5s slow tempo down to build One-Arm Push-Up foundation." },
    { dayName: "Monday", dayNumber: 1, focus: "Push & Chest Endurance (1.5 Hours)", phase: "Main Workout", orderInPhase: 5, exerciseName: "Bench Dip", equipment: "Bench", sets: "9", repsOrDuration: "45 reps", rest: "60s", coachingNotes: "Tricep & chest lower push." },
    { dayName: "Monday", dayNumber: 1, focus: "Push & Chest Endurance (1.5 Hours)", phase: "Finisher", orderInPhase: 1, exerciseName: "Plank", equipment: "Bodyweight", sets: "1", repsOrDuration: "270 sec", rest: "90s", coachingNotes: "Core & push stability finisher (4.5 min)." },

    // Day 2: Tuesday — PULL, GRIP & BACK MASTERY (1.5 Hours)
    { dayName: "Tuesday", dayNumber: 2, focus: "Pull & Grip Strength (1.5 Hours)", phase: "Warmup", orderInPhase: 1, exerciseName: "Shoulder Mobility", equipment: "Bodyweight", sets: "1", repsOrDuration: "6 min", rest: "30s", coachingNotes: "Open up shoulder capsular space." },
    { dayName: "Tuesday", dayNumber: 2, focus: "Pull & Grip Strength (1.5 Hours)", phase: "Main Workout", orderInPhase: 1, exerciseName: "Passive Dead Hang", equipment: "Pull-Up Bar", sets: "1", repsOrDuration: "180 sec", rest: "90s", coachingNotes: "3-minute dead hang grip & shoulder endurance." },
    { dayName: "Tuesday", dayNumber: 2, focus: "Pull & Grip Strength (1.5 Hours)", phase: "Main Workout", orderInPhase: 2, exerciseName: "Active Hang", equipment: "Pull-Up Bar", sets: "1", repsOrDuration: "90 sec", rest: "60s", coachingNotes: "Depress scapula & engage lower traps." },
    { dayName: "Tuesday", dayNumber: 2, focus: "Pull & Grip Strength (1.5 Hours)", phase: "Main Workout", orderInPhase: 3, exerciseName: "Scapular Pull-Up", equipment: "Pull-Up Bar", sets: "9", repsOrDuration: "30 reps", rest: "60s", coachingNotes: "Initiate pull without bending elbows." },
    { dayName: "Tuesday", dayNumber: 2, focus: "Pull & Grip Strength (1.5 Hours)", phase: "Main Workout", orderInPhase: 4, exerciseName: "Australian Row", equipment: "Low Bar / Rings", sets: "9", repsOrDuration: "45 reps", rest: "60s", coachingNotes: "Chest to bar horizontal pulling power." },
    { dayName: "Tuesday", dayNumber: 2, focus: "Pull & Grip Strength (1.5 Hours)", phase: "Main Workout", orderInPhase: 5, exerciseName: "Negative Pull-Up", equipment: "Pull-Up Bar", sets: "9", repsOrDuration: "15 reps", rest: "90s", coachingNotes: "5s slow tempo down to build strict pull-up strength." },
    { dayName: "Tuesday", dayNumber: 2, focus: "Pull & Grip Strength (1.5 Hours)", phase: "Finisher", orderInPhase: 1, exerciseName: "Towel Hang", equipment: "Towel + Bar", sets: "1", repsOrDuration: "90 sec", rest: "60s", coachingNotes: "Forearm & crushing grip finisher." },

    // Day 3: Wednesday — LEGS & LOWER BODY MASTERY (1.5 Hours)
    { dayName: "Wednesday", dayNumber: 3, focus: "Legs & Lower Body Capacity (1.5 Hours)", phase: "Warmup", orderInPhase: 1, exerciseName: "Ankle Mobility", equipment: "Bodyweight", sets: "1", repsOrDuration: "6 min", rest: "30s", coachingNotes: "Dorsiflexion for deep squat depth." },
    { dayName: "Wednesday", dayNumber: 3, focus: "Legs & Lower Body Capacity (1.5 Hours)", phase: "Main Workout", orderInPhase: 1, exerciseName: "Bodyweight Squat", equipment: "Bodyweight", sets: "9", repsOrDuration: "60 reps", rest: "90s", coachingNotes: "Deep hip crease below knees." },
    { dayName: "Wednesday", dayNumber: 3, focus: "Legs & Lower Body Capacity (1.5 Hours)", phase: "Main Workout", orderInPhase: 2, exerciseName: "Bulgarian Split Squat", equipment: "Bench", sets: "9", repsOrDuration: "30 reps", rest: "60s", coachingNotes: "Single leg quad & glute drive." },
    { dayName: "Wednesday", dayNumber: 3, focus: "Legs & Lower Body Capacity (1.5 Hours)", phase: "Main Workout", orderInPhase: 3, exerciseName: "Reverse Lunge", equipment: "Bodyweight", sets: "9", repsOrDuration: "36 reps", rest: "60s", coachingNotes: "Knee stability & lunging volume." },
    { dayName: "Wednesday", dayNumber: 3, focus: "Legs & Lower Body Capacity (1.5 Hours)", phase: "Main Workout", orderInPhase: 4, exerciseName: "Single-Leg Glute Bridge", equipment: "Bodyweight", sets: "9", repsOrDuration: "30 reps", rest: "60s", coachingNotes: "Posterior chain glute lockout." },
    { dayName: "Wednesday", dayNumber: 3, focus: "Legs & Lower Body Capacity (1.5 Hours)", phase: "Main Workout", orderInPhase: 5, exerciseName: "Standing Calf Raise", equipment: "Step / Flat", sets: "9", repsOrDuration: "60 reps", rest: "45s", coachingNotes: "Achilles & calf endurance." },
    { dayName: "Wednesday", dayNumber: 3, focus: "Legs & Lower Body Capacity (1.5 Hours)", phase: "Finisher", orderInPhase: 1, exerciseName: "Wall Sit", equipment: "Wall", sets: "1", repsOrDuration: "270 sec", rest: "90s", coachingNotes: "Isometric quad endurance (4.5 min)." },

    // Day 4: Thursday — CORE, ARM BALANCE & SKILL PREP (1.5 Hours)
    { dayName: "Thursday", dayNumber: 4, focus: "Core, Arm Balance & Skill Prep (1.5 Hours)", phase: "Warmup", orderInPhase: 1, exerciseName: "Wrist Conditioning", equipment: "Bodyweight", sets: "1", repsOrDuration: "6 min", rest: "30s", coachingNotes: "Wrist extension & flexion prep." },
    { dayName: "Thursday", dayNumber: 4, focus: "Core, Arm Balance & Skill Prep (1.5 Hours)", phase: "Main Workout", orderInPhase: 1, exerciseName: "Plank", equipment: "Bodyweight", sets: "1", repsOrDuration: "270 sec", rest: "90s", coachingNotes: "Strict hollow body plank (4.5 min)." },
    { dayName: "Thursday", dayNumber: 4, focus: "Core, Arm Balance & Skill Prep (1.5 Hours)", phase: "Main Workout", orderInPhase: 2, exerciseName: "Side Plank", equipment: "Bodyweight", sets: "1", repsOrDuration: "135 sec", rest: "60s", coachingNotes: "Oblique & lateral core stamina." },
    { dayName: "Thursday", dayNumber: 4, focus: "Core, Arm Balance & Skill Prep (1.5 Hours)", phase: "Main Workout", orderInPhase: 3, exerciseName: "Hollow Body Hold", equipment: "Bodyweight", sets: "1", repsOrDuration: "135 sec", rest: "60s", coachingNotes: "Lower back pressed into floor." },
    { dayName: "Thursday", dayNumber: 4, focus: "Core, Arm Balance & Skill Prep (1.5 Hours)", phase: "Main Workout", orderInPhase: 4, exerciseName: "Lying Leg Raise", equipment: "Bodyweight", sets: "9", repsOrDuration: "36 reps", rest: "60s", coachingNotes: "Controlled leg lift without swinging." },
    { dayName: "Thursday", dayNumber: 4, focus: "Core, Arm Balance & Skill Prep (1.5 Hours)", phase: "Main Workout", orderInPhase: 5, exerciseName: "Dead Bug", equipment: "Bodyweight", sets: "9", repsOrDuration: "36 reps", rest: "60s", coachingNotes: "Cross-body core coordination." },
    { dayName: "Thursday", dayNumber: 4, focus: "Core, Arm Balance & Skill Prep (1.5 Hours)", phase: "Finisher", orderInPhase: 1, exerciseName: "Tuck Hold", equipment: "Parallettes / Floor", sets: "1", repsOrDuration: "90 sec", rest: "60s", coachingNotes: "Compressive core & L-sit prep." },

    // Day 5: Friday — UPPER BODY PUSH/PULL POWER & ONE-ARM PREP (1.5 Hours)
    { dayName: "Friday", dayNumber: 5, focus: "Upper Body Push/Pull Power (1.5 Hours)", phase: "Warmup", orderInPhase: 1, exerciseName: "Shoulder Mobility", equipment: "Bodyweight", sets: "1", repsOrDuration: "6 min", rest: "30s", coachingNotes: "Shoulder girdle warm-up." },
    { dayName: "Friday", dayNumber: 5, focus: "Upper Body Push/Pull Power (1.5 Hours)", phase: "Main Workout", orderInPhase: 1, exerciseName: "Standard Push-Up", equipment: "Bodyweight", sets: "9", repsOrDuration: "45 reps", rest: "90s", coachingNotes: "Push-up volume drive for 75+ rep endurance goal." },
    { dayName: "Friday", dayNumber: 5, focus: "Upper Body Push/Pull Power (1.5 Hours)", phase: "Main Workout", orderInPhase: 2, exerciseName: "Wide Push-Up", equipment: "Bodyweight", sets: "9", repsOrDuration: "45 reps", rest: "60s", coachingNotes: "Chest stretch & shoulder engagement." },
    { dayName: "Friday", dayNumber: 5, focus: "Upper Body Push/Pull Power (1.5 Hours)", phase: "Main Workout", orderInPhase: 3, exerciseName: "Australian Row", equipment: "Low Bar / Rings", sets: "9", repsOrDuration: "45 reps", rest: "60s", coachingNotes: "Upper back pulling density." },
    { dayName: "Friday", dayNumber: 5, focus: "Upper Body Push/Pull Power (1.5 Hours)", phase: "Main Workout", orderInPhase: 4, exerciseName: "Scapular Pull-Up", equipment: "Pull-Up Bar", sets: "9", repsOrDuration: "30 reps", rest: "60s", coachingNotes: "Scapular depression power." },
    { dayName: "Friday", dayNumber: 5, focus: "Upper Body Push/Pull Power (1.5 Hours)", phase: "Main Workout", orderInPhase: 5, exerciseName: "Bench Dip", equipment: "Bench", sets: "9", repsOrDuration: "45 reps", rest: "60s", coachingNotes: "Tricep dip lockout." },
    { dayName: "Friday", dayNumber: 5, focus: "Upper Body Push/Pull Power (1.5 Hours)", phase: "Finisher", orderInPhase: 1, exerciseName: "Passive Dead Hang", equipment: "Pull-Up Bar", sets: "1", repsOrDuration: "180 sec", rest: "90s", coachingNotes: "Grip & decompression finisher (3 min)." },

    // Day 6: Saturday — FULL BODY MASTERY & ENDURANCE CAPACITY (1.5 Hours)
    { dayName: "Saturday", dayNumber: 6, focus: "Full Body Endurance & Capacity (1.5 Hours)", phase: "Warmup", orderInPhase: 1, exerciseName: "Deep Squat Mobility", equipment: "Bodyweight", sets: "1", repsOrDuration: "6 min", rest: "30s", coachingNotes: "Full body joint lubrication." },
    { dayName: "Saturday", dayNumber: 6, focus: "Full Body Endurance & Capacity (1.5 Hours)", phase: "Main Workout", orderInPhase: 1, exerciseName: "Standard Push-Up", equipment: "Bodyweight", sets: "9", repsOrDuration: "45 reps", rest: "90s", coachingNotes: "Endurance push capacity." },
    { dayName: "Saturday", dayNumber: 6, focus: "Full Body Endurance & Capacity (1.5 Hours)", phase: "Main Workout", orderInPhase: 2, exerciseName: "Bodyweight Squat", equipment: "Bodyweight", sets: "9", repsOrDuration: "60 reps", rest: "90s", coachingNotes: "Leg endurance density." },
    { dayName: "Saturday", dayNumber: 6, focus: "Full Body Endurance & Capacity (1.5 Hours)", phase: "Main Workout", orderInPhase: 3, exerciseName: "Passive Dead Hang", equipment: "Pull-Up Bar", sets: "1", repsOrDuration: "180 sec", rest: "90s", coachingNotes: "Grip hold capacity." },
    { dayName: "Saturday", dayNumber: 6, focus: "Full Body Endurance & Capacity (1.5 Hours)", phase: "Main Workout", orderInPhase: 4, exerciseName: "Plank", equipment: "Bodyweight", sets: "1", repsOrDuration: "270 sec", rest: "90s", coachingNotes: "Strict core plank (4.5 min)." },
    { dayName: "Saturday", dayNumber: 6, focus: "Full Body Endurance & Capacity (1.5 Hours)", phase: "Main Workout", orderInPhase: 5, exerciseName: "Lying Leg Raise", equipment: "Bodyweight", sets: "9", repsOrDuration: "36 reps", rest: "60s", coachingNotes: "Lower abs volume." },
    { dayName: "Saturday", dayNumber: 6, focus: "Full Body Endurance & Capacity (1.5 Hours)", phase: "Finisher", orderInPhase: 1, exerciseName: "Deep Squat Hold", equipment: "Bodyweight", sets: "1", repsOrDuration: "180 sec", rest: "90s", coachingNotes: "Hip & ankle mobility hold (3 min)." },

    // Day 7: Sunday — REST & ACTIVE RECOVERY
    { dayName: "Sunday", dayNumber: 7, focus: "Rest & Active Recovery", phase: "Recovery", orderInPhase: 1, exerciseName: "Shoulder Mobility", equipment: "Bodyweight", sets: "1", repsOrDuration: "10 min", rest: "0s", coachingNotes: "Light stretching & full body recovery." },
  ];

  await prisma.weeklyPlan.createMany({ data: newPlan });
  console.log(`Successfully populated ${newPlan.length} exercises across Monday - Saturday (1.5 Hours daily)!`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
