const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  const tracks = await prisma.track.findMany();
  console.log(tracks);
  await prisma.$disconnect();
})();
