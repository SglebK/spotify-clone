const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const audioFiles = [
  '/uploads/audio/1772733243141-263521459.mp3',
  '/uploads/audio/1772733265703-881366510.mp3',
  '/uploads/audio/1772734141024-220187221.mp3',
  '/uploads/audio/1773446129022-990573792.mp3',
  '/uploads/audio/1773446866078-907544445.mp3',
  '/uploads/audio/1773447202910-439811655.mp3',
  '/uploads/audio/1773483048811-46334123.mp3',
  '/uploads/audio/1773483084613-973875812.mp3'
];

const coverFiles = [
  '/uploads/covers/1772734141047-400351288.jpg',
  '/uploads/covers/1773446129084-419218241.jpg',
  '/uploads/covers/1773446866101-414700032.jpg',
  '/uploads/covers/1773447202948-825934756.jpg',
  '/uploads/covers/1773483048900-618164336.jpg',
  '/uploads/covers/1773483084637-221368000.jpg'
];

const demoTracks = Array.from({ length: 8 }, (_, index) => ({
  title: `Тест ${index + 1}`,
  artist: `Demo Artist ${index + 1}`,
  audioUrl: audioFiles[index % audioFiles.length],
  coverUrl: coverFiles[index % coverFiles.length],
  isPublic: true,
  userId: null
}));

async function main() {
  let created = 0;

  for (const track of demoTracks) {
    const existing = await prisma.track.findFirst({
      where: {
        title: track.title,
        artist: track.artist,
        deletedAt: null
      }
    });

    if (existing) {
      continue;
    }

    await prisma.track.create({ data: track });
    created += 1;
  }

  console.log(`Demo tracks ready. Added: ${created}`);
}

main()
  .catch((error) => {
    console.error('Failed to seed demo tracks', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
