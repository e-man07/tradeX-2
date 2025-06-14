import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

async function main() {
  const allUsers = await prisma.user.findMany();
  console.log(allUsers);
}
main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
