const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const audioFiles = [
  '/uploads/audio/seed-calm-01.mp3',
  '/uploads/audio/seed-calm-02.mp3',
  '/uploads/audio/seed-calm-03.mp3',
  '/uploads/audio/seed-calm-04.mp3',
  '/uploads/audio/seed-calm-05.mp3',
  '/uploads/audio/seed-calm-06.mp3'
];

const coverFiles = [
  '/uploads/covers/seed-cover-01.jpg',
  '/uploads/covers/seed-cover-02.jpg',
  '/uploads/covers/seed-cover-03.jpg',
  '/uploads/covers/seed-cover-04.jpg',
  '/uploads/covers/seed-cover-05.jpg',
  '/uploads/covers/seed-cover-06.jpg',
  '/uploads/covers/seed-cover-07.jpg',
  '/uploads/covers/seed-cover-08.jpg'
];

const demoUsers = [
  { email: 'admin@spotify.local', timeZone: 'Europe/Berlin', isAdmin: true },
  { email: 'demo1@spotify.local', timeZone: 'Europe/Berlin', isAdmin: false },
  { email: 'demo2@spotify.local', timeZone: 'Europe/Kiev', isAdmin: false },
  { email: 'demo3@spotify.local', timeZone: 'Europe/Warsaw', isAdmin: false },
  { email: 'demo4@spotify.local', timeZone: 'Europe/Prague', isAdmin: false }
];

const seededTracks = [
  { title: 'Quiet Shore', artist: 'Lumen Drift' },
  { title: 'Soft Horizon', artist: 'Amber Tides' },
  { title: 'Night Window', artist: 'North Ember' },
  { title: 'Still Water', artist: 'Mira Vale' },
  { title: 'Calm Transit', artist: 'Grey Lantern' },
  { title: 'Blue Haze', artist: 'Serein Field' }
];

function ensureMediaExists() {
  for (const audioUrl of audioFiles) {
    const filePath = path.join(__dirname, '..', audioUrl);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing audio seed file: ${audioUrl}`);
    }
  }

  for (const coverUrl of coverFiles) {
    const filePath = path.join(__dirname, '..', coverUrl);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing cover seed file: ${coverUrl}`);
    }
  }
}

async function ensureUser(email, timeZone, passwordHash) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return prisma.user.update({
      where: { email },
      data: {
        password: passwordHash,
        timeZone,
        isAdmin: email === 'admin@spotify.local'
      }
    });
  }

  return prisma.user.create({
    data: {
      email,
      password: passwordHash,
      timeZone,
      isAdmin: email === 'admin@spotify.local'
    }
  });
}

async function ensureTrack(trackData) {
  const existing = await prisma.track.findFirst({
    where: {
      title: trackData.title,
      artist: trackData.artist,
      userId: trackData.userId ?? null,
      deletedAt: null
    }
  });

  if (existing) return existing;
  return prisma.track.create({ data: trackData });
}

async function ensurePlaylist(userId, title, description, coverUrl, trackIds) {
  let playlist = await prisma.playlist.findFirst({
    where: {
      userId,
      title,
      deletedAt: null
    }
  });

  if (!playlist) {
    playlist = await prisma.playlist.create({
      data: {
        userId,
        title,
        description,
        coverUrl,
        isPublic: true
      }
    });
  }

  for (let index = 0; index < trackIds.length; index += 1) {
    const trackId = trackIds[index];
    const existing = await prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: {
          playlistId: playlist.id,
          trackId
        }
      }
    });

    if (existing && !existing.deletedAt) continue;

    if (existing && existing.deletedAt) {
      await prisma.playlistTrack.update({
        where: {
          playlistId_trackId: {
            playlistId: playlist.id,
            trackId
          }
        },
        data: {
          deletedAt: null,
          restoredAt: new Date(),
          order: index
        }
      });
      continue;
    }

    await prisma.playlistTrack.create({
      data: {
        playlistId: playlist.id,
        trackId,
        order: index
      }
    });
  }
}

async function main() {
  ensureMediaExists();
  const passwordHash = await bcrypt.hash('demo12345', 10);
  const users = [];

  await prisma.playlistTrack.deleteMany({});
  await prisma.playlist.deleteMany({});
  await prisma.track.deleteMany({});

  for (const demoUser of demoUsers) {
    const user = await ensureUser(demoUser.email, demoUser.timeZone, passwordHash);
    users.push(user);
  }

  const createdSeededTracks = [];
  for (let index = 0; index < seededTracks.length; index += 1) {
    const track = await ensureTrack({
      title: seededTracks[index].title,
      artist: seededTracks[index].artist,
      audioUrl: audioFiles[index % audioFiles.length],
      coverUrl: coverFiles[index % coverFiles.length],
      isPublic: true,
      userId: null
    });
    createdSeededTracks.push(track);
  }

  for (let index = 0; index < users.length; index += 1) {
    const user = users[index];
    const baseOffset = index * 2;

    const userTracks = await Promise.all([
      ensureTrack({
        title: ['Velvet Echo', 'Paper Sky', 'Moon Corridor', 'Pale Signal', 'Drift Lantern'][index] || `Calm Set ${index + 1}`,
        artist: ['Riverline', 'Hollow Trees', 'Noon Harbor', 'Silent Arcade', 'Atlas Glow'][index] || `Artist ${index + 1}`,
        audioUrl: audioFiles[(baseOffset + 1) % audioFiles.length],
        coverUrl: coverFiles[(baseOffset + 1) % coverFiles.length],
        isPublic: true,
        userId: user.id
      }),
      ensureTrack({
        title: ['Dust Light', 'Small Aurora', 'Fading Maps', 'Cedar Sleep', 'Open Room'][index] || `Night Set ${index + 1}`,
        artist: ['Harbor Thread', 'Calm Vessel', 'Mistral Noon', 'Still Borough', 'Wide Meadow'][index] || `Artist B ${index + 1}`,
        audioUrl: audioFiles[(baseOffset + 2) % audioFiles.length],
        coverUrl: coverFiles[(baseOffset + 2) % coverFiles.length],
        isPublic: index % 2 === 0,
        userId: user.id
      })
    ]);

    await ensurePlaylist(
      user.id,
      ['Evening Calm', 'Soft Routes', 'Quiet Desk', 'Slow City', 'Night Study'][index] || `Mood ${index + 1}`,
      [
        'Небольшой спокойный плейлист для вечернего прослушивания.',
        'Мягкие инструментальные треки для дороги и отдыха.',
        'Фоновый набор для работы без слов.',
        'Спокойная подборка с городским настроением.',
        'Тихая музыка для ночной концентрации.'
      ][index] || 'Демо-плейлист со спокойной музыкой.',
      coverFiles[index % coverFiles.length],
      [userTracks[0].id, createdSeededTracks[index % createdSeededTracks.length].id, userTracks[1].id]
    );
  }

  console.log('Full demo data ready.');
  console.log('Admin login: admin@spotify.local / demo12345');
  console.log('Demo login password for created users: demo12345');
}

main()
  .catch((error) => {
    console.error('Failed to seed full demo data', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
