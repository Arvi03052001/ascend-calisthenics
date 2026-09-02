import { PrismaClient } from "@prisma/client";

const SOURCE_DB_URL = "postgresql://neondb_owner:npg_AI5gQrm2lMqf@ep-royal-sunset-b3z8ntw8-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const TARGET_DB_URL = "postgresql://neondb_owner:npg_yjO4EbIvA8Pm@ep-lucky-block-b3vbkb3k-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  console.log("Connecting to Cloud Gym DB...");
  const sourcePrisma = new PrismaClient({
    datasources: { db: { url: SOURCE_DB_URL } },
  });

  console.log("Connecting to Ascend DB...");
  const targetPrisma = new PrismaClient({
    datasources: { db: { url: TARGET_DB_URL } },
  });

  try {
    // 1. Fetch all 112 rows from weekly_plan in Cloud Gym
    console.log("Fetching all rows from weekly_plan in Cloud Gym...");
    const rows: any[] = await sourcePrisma.$queryRaw`
      SELECT day_name, day_number, focus, phase, order_in_phase, exercise_name, equipment, sets, reps_or_duration, rest, coaching_notes
      FROM "weekly_plan"
      ORDER BY day_number ASC, phase ASC, order_in_phase ASC;
    `;

    console.log(`Fetched ${rows.length} rows from Cloud Gym weekly_plan table!`);
    if (rows.length > 0) {
      console.log("Sample Row 1:", rows[0]);
    }

    if (rows.length === 0) {
      console.error("No rows found! Aborting wipe.");
      return;
    }

    // 2. Wipe existing SessionLog, Workout, and WeeklyPlan in Ascend DB
    console.log("Wiping existing Workout, SessionLog, and WeeklyPlan tables in Ascend DB...");
    await targetPrisma.sessionLog.deleteMany({});
    await targetPrisma.workout.deleteMany({});
    await targetPrisma.weeklyPlan.deleteMany({});

    // 3. Map rows to Ascend WeeklyPlan schema
    const insertData = rows.map((r) => ({
      dayName: r.day_name || "",
      dayNumber: Number(r.day_number) || 1,
      focus: r.focus || "",
      phase: r.phase || "",
      orderInPhase: Number(r.order_in_phase) || 1,
      exerciseName: r.exercise_name || "",
      equipment: r.equipment || null,
      sets: String(r.sets || "3"),
      repsOrDuration: r.reps_or_duration ? String(r.reps_or_duration) : null,
      rest: r.rest ? String(r.rest) : null,
      coachingNotes: r.coaching_notes ? String(r.coaching_notes) : null,
    }));

    // 4. Batch insert into Ascend WeeklyPlan
    console.log(`Inserting ${insertData.length} rows into Ascend WeeklyPlan...`);
    await targetPrisma.weeklyPlan.createMany({
      data: insertData,
    });

    console.log(`SUCCESS! 🚀 Copied all ${insertData.length} rows from Cloud Gym DB to Ascend DB!`);
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

main();
