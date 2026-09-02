import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing old workout instances in Neon DB so all days pull the fresh 1.5hr workout plan...");

  const deletedWorkouts = await prisma.workout.deleteMany({});
  console.log(`Deleted ${deletedWorkouts.count} old workout instances!`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
