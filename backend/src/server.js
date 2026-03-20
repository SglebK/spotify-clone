require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const FAVORITES_TITLE = 'Любимые треки';
const MAX_AUDIO_SIZE = 20 * 1024 * 1024;
const MAX_COVER_SIZE = 5 * 1024 * 1024;
const ALLOWED_AUDIO_MIME = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4'];
const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const uploadsRoot = path.join(__dirname, '../uploads');
['audio', 'covers', 'other'].forEach((dir) => {
  fs.mkdirSync(path.join(uploadsRoot, dir), { recursive: true });
});

// middleware
app.use(cors());
app.use(express.json());
// static files for uploaded media
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// helper -------------------------------------------------------------
const jwtOpts = { expiresIn: '15m' };
function generateAccessToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, jwtOpts);
}
function generateRefreshToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

async function getUserFromRefreshToken(refreshToken) {
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await prisma.user.findUnique({ where: { id: payload.id } });

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error('Invalid token');
  }

  return user;
}

async function authenticate(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new Error('User not found');
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// file upload configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === 'audio') cb(null, path.join(__dirname, '../uploads/audio'));
    else if (file.fieldname === 'cover') cb(null, path.join(__dirname, '../uploads/covers'));
    else cb(null, path.join(__dirname, '../uploads/other'));
  },
  filename(req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_AUDIO_SIZE
  },
  fileFilter(req, file, cb) {
    if (file.fieldname === 'audio' && !ALLOWED_AUDIO_MIME.includes(file.mimetype)) {
      return cb(new Error('Audio must be MP3, WAV, OGG or M4A'));
    }

    if (file.fieldname === 'cover' && !ALLOWED_IMAGE_MIME.includes(file.mimetype)) {
      return cb(new Error('Cover must be JPG, PNG or WEBP'));
    }

    cb(null, true);
  }
});

function containsInsensitive(field, value) {
  return {
    [field]: {
      contains: value
    }
  };
}

function parseTrackFilters(query, scope = 'public') {
  const search = (query.search || '').trim();
  const sortBy = ['title', 'createdAt'].includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const type = (query.type || 'all').trim();
  const filters = search
    ? {
        OR: [
          containsInsensitive('title', search),
          containsInsensitive('artist', search)
        ]
      }
    : {};

  if (scope === 'my') {
    if (type === 'public') filters.isPublic = true;
    if (type === 'private') filters.isPublic = false;
  }

  if (scope === 'public') {
    if (type === 'seeded') filters.userId = null;
    if (type === 'uploaded') {
      filters.userId = { not: null };
      filters.isPublic = true;
    }
  }

  return {
    filters,
    orderBy: { [sortBy]: sortOrder }
  };
}

function validateTrackPayload({ title, artist }) {
  if (!title?.trim()) {
    return 'Title is required';
  }

  if (!artist?.trim()) {
    return 'Artist is required';
  }

  return null;
}

function mapUser(user) {
  return {
    id: user.id,
    email: user.email,
    timeZone: user.timeZone,
    isAdmin: !!user.isAdmin
  };
}

function removeFileIfExists(file) {
  if (!file?.path) return;

  fs.promises.unlink(file.path).catch(() => {});
}

function ensureUploadSizes(files) {
  const audioFile = files?.audio?.[0];
  const coverFile = files?.cover?.[0];

  if (audioFile?.size > MAX_AUDIO_SIZE) {
    removeFileIfExists(audioFile);
    throw new Error('Audio file is too large. Max size is 20 MB');
  }

  if (coverFile?.size > MAX_COVER_SIZE) {
    removeFileIfExists(coverFile);
    throw new Error('Cover image is too large. Max size is 5 MB');
  }
}

// ------------------------------------------------------------------
app.get('/api/status/ping', (req, res) => {
  res.json({ ok: true });
});

// ------------------------------------------------------------------
// auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, timeZone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, timeZone: timeZone || 'UTC' }
    });

    // optionally issue tokens (frontend currently ignores them)
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    res.json({ id: user.id, token, refreshToken, user: mapUser(user) });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
  res.json({ token, refreshToken, user: mapUser(user) });
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  try {
    const user = await getUserFromRefreshToken(refreshToken);
    const token = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });
    res.json({
      token,
      refreshToken: newRefreshToken,
      user: mapUser(user)
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  const auth = req.headers.authorization || '';
  const accessToken = auth.replace(/^Bearer\s+/i, '');
  const { refreshToken } = req.body || {};

  try {
    if (refreshToken) {
      const user = await getUserFromRefreshToken(refreshToken);
      await prisma.user.update({ where: { id: user.id }, data: { refreshToken: null } });
      return res.json({ success: true });
    }

    if (accessToken) {
      const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      await prisma.user.update({ where: { id: payload.id }, data: { refreshToken: null } });
      return res.json({ success: true });
    }
  } catch (err) {
    return res.json({ success: true });
  }

  res.json({ success: true });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json(mapUser(req.user));
});

// ------------------------------------------------------------------
// tracks
app.get('/api/tracks', async (req, res) => {
  const { filters, orderBy } = parseTrackFilters(req.query, 'public');
  const tracks = await prisma.track.findMany({
    where: {
      deletedAt: null,
      OR: [{ userId: null }, { isPublic: true }],
      ...filters
    },
    orderBy
  });
  res.json(tracks);
});

app.get('/api/tracks/my', authenticate, async (req, res) => {
  const { filters, orderBy } = parseTrackFilters(req.query, 'my');
  const tracks = await prisma.track.findMany({
    where: {
      userId: req.user.id,
      deletedAt: null,
      ...filters
    },
    orderBy
  });
  res.json(tracks);
});

app.post('/api/tracks/upload', authenticate, upload.fields([{ name: 'audio' }, { name: 'cover' }]),
  async (req, res) => {
    try {
      const { title, artist } = req.body;
      const payloadError = validateTrackPayload({ title, artist });

      if (payloadError || !req.files?.audio?.length) {
        return res.status(400).json({ error: payloadError || 'title, artist and audio file required' });
      }

      ensureUploadSizes(req.files);

      const audioPath = `/uploads/audio/${req.files.audio[0].filename}`;
      const coverPath = req.files.cover ? `/uploads/covers/${req.files.cover[0].filename}` : null;
      const track = await prisma.track.create({
        data: {
          title,
          artist,
          audioUrl: audioPath,
          coverUrl: coverPath,
          isPublic: false,
          userId: req.user.id
        }
      });
      res.json(track);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to upload track' });
    }
  }
);

app.put('/api/tracks/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, artist, isPublic } = req.body;
  const data = {};

  if (typeof title === 'string') {
    if (!title.trim()) return res.status(400).json({ error: 'Title is required' });
    data.title = title.trim();
  }
  if (typeof artist === 'string') {
    if (!artist.trim()) return res.status(400).json({ error: 'Artist is required' });
    data.artist = artist.trim();
  }
  if (typeof isPublic === 'boolean') data.isPublic = isPublic;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  try {
    const updated = await prisma.track.updateMany({
      where: { id, userId: req.user.id, deletedAt: null },
      data
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    const track = await prisma.track.findUnique({ where: { id } });
    res.json(track);
  } catch (err) {
    console.error('update track error', err);
    res.status(500).json({ error: 'Unable to update track' });
  }
});

app.put('/api/tracks/:id/details', authenticate, upload.fields([{ name: 'cover', maxCount: 1 }]), async (req, res) => {
  const { id } = req.params;
  const { title, artist, isPublic } = req.body;
  const data = {};

  if (typeof title === 'string') {
    if (!title.trim()) return res.status(400).json({ error: 'Title is required' });
    data.title = title.trim();
  }
  if (typeof artist === 'string') {
    if (!artist.trim()) return res.status(400).json({ error: 'Artist is required' });
    data.artist = artist.trim();
  }
  if (typeof isPublic === 'string') data.isPublic = isPublic === 'true';
  if (typeof isPublic === 'boolean') data.isPublic = isPublic;

  const coverFile = req.files?.cover?.[0];
  if (coverFile) {
    ensureUploadSizes(req.files);
    data.coverUrl = `/uploads/covers/${coverFile.filename}`;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  try {
    const updated = await prisma.track.updateMany({
      where: { id, userId: req.user.id, deletedAt: null },
      data
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    const track = await prisma.track.findUnique({ where: { id } });
    res.json(track);
  } catch (err) {
    console.error('update track details error', err);
    res.status(500).json({ error: 'Unable to update track details' });
  }
});

app.delete('/api/tracks/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.track.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(req.user.isAdmin ? {} : { userId: req.user.id })
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Track not found' });
    }

    await prisma.playlistTrack.deleteMany({ where: { trackId: id } });
    await prisma.track.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('delete track error', err);
    res.status(500).json({ error: 'Unable to delete track' });
  }
});

// ------------------------------------------------------------------
// playlists
app.get('/api/playlists/my', authenticate, async (req, res) => {
  const search = (req.query.search || '').trim();
  const lists = await prisma.playlist.findMany({
    where: {
      userId: req.user.id,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              containsInsensitive('title', search),
              containsInsensitive('description', search)
            ]
          }
        : {})
    },
    orderBy: [{ isFavorites: 'desc' }, { createdAt: 'desc' }]
  });
  res.json(lists);
});

app.get('/api/playlists/public', async (req, res) => {
  const search = (req.query.search || '').trim();

  // Public playlists power both the dedicated page and the global search results view.
  const lists = await prisma.playlist.findMany({
    where: {
      deletedAt: null,
      isPublic: true,
      ...(search
        ? {
            OR: [
              containsInsensitive('title', search),
              containsInsensitive('description', search)
            ]
          }
        : {})
    },
    include: {
      user: {
        select: {
          email: true
        }
      },
      tracks: {
        where: { deletedAt: null },
        include: { track: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(lists.map((playlist) => ({
    ...playlist,
    ownerEmail: playlist.user?.email || null,
    trackCount: playlist.tracks.length,
    tracks: playlist.tracks.map((item) => item.track)
  })));
});

app.get('/api/playlists/public/:id', async (req, res) => {
  const { id } = req.params;

  const playlist = await prisma.playlist.findFirst({
    where: { id, deletedAt: null, isPublic: true },
    include: {
      user: {
        select: {
          email: true
        }
      },
      tracks: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
        include: { track: true }
      }
    }
  });

  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  res.json({
    ...playlist,
    ownerEmail: playlist.user?.email || null,
    tracks: playlist.tracks.map((item) => item.track)
  });
});

app.post('/api/playlists', authenticate, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'title required' });
    const pl = await prisma.playlist.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        coverUrl: null,
        isFavorites: false,
        userId: req.user.id
      }
    });
    res.json(pl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create playlist' });
  }
});

app.get('/api/playlists/:id', authenticate, async (req, res, next) => {
  const { id } = req.params;
  if (id === 'favorites') return next();
  const pl = await prisma.playlist.findUnique({
    where: { id },
    include: {
      tracks: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
        include: { track: true }
      }
    }
  });
  if (!pl || pl.userId !== req.user.id) return res.status(404).json({ error: 'Playlist not found' });
  // unwrap tracks
  const tracks = pl.tracks.map(pt => pt.track);
  res.json({ ...pl, tracks });
});

app.put('/api/playlists/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const input = req.body;
  const update = {};
  if (input.Title != null) update.title = input.Title;
  if (input.title != null) update.title = input.title;
  if (input.Description != null) update.description = input.Description;
  if (input.description != null) update.description = input.description;
  if (input.IsPublic != null) update.isPublic = input.IsPublic;
  if (input.isPublic != null) update.isPublic = input.isPublic;
  try {
    const playlist = await prisma.playlist.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(req.user.isAdmin ? {} : { userId: req.user.id })
      }
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.isFavorites && update.title && update.title !== playlist.title) {
      return res.status(400).json({ error: 'Favorites playlist cannot be renamed' });
    }

    await prisma.playlist.updateMany({
      where: { id, userId: req.user.id },
      data: update
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Unable to update playlist' });
  }
});

app.delete('/api/playlists/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const playlist = await prisma.playlist.findFirst({
      where: { id, userId: req.user.id, deletedAt: null }
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.isFavorites) {
      return res.status(400).json({ error: 'Favorites playlist cannot be deleted' });
    }

    // remove any tracks linked to the playlist first to satisfy foreign keys
    await prisma.playlistTrack.deleteMany({ where: { playlistId: id } });
    await prisma.playlist.deleteMany({ where: { id, userId: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('delete playlist error', err);
    res.status(500).json({ error: 'Unable to delete playlist' });
  }
});

app.put('/api/playlists/:id/details', authenticate, upload.fields([{ name: 'cover', maxCount: 1 }]), async (req, res) => {
  const { id } = req.params;
  const { title, description, isPublic } = req.body;
  const data = {};

  if (typeof title === 'string') {
    if (!title.trim()) return res.status(400).json({ error: 'Title is required' });
    data.title = title.trim();
  }
  if (typeof description === 'string') data.description = description.trim() || null;
  if (typeof isPublic === 'string') data.isPublic = isPublic === 'true';
  if (typeof isPublic === 'boolean') data.isPublic = isPublic;

  const coverFile = req.files?.cover?.[0];
  if (coverFile) {
    ensureUploadSizes(req.files);
    data.coverUrl = `/uploads/covers/${coverFile.filename}`;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  try {
    const playlist = await prisma.playlist.findFirst({
      where: { id, userId: req.user.id, deletedAt: null }
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.isFavorites && data.title && data.title !== playlist.title) {
      return res.status(400).json({ error: 'Favorites playlist cannot be renamed' });
    }

    await prisma.playlist.update({
      where: { id },
      data
    });

    const updated = await prisma.playlist.findUnique({ where: { id } });
    res.json(updated);
  } catch (err) {
    console.error('update playlist details error', err);
    res.status(500).json({ error: 'Unable to update playlist details' });
  }
});

app.post('/api/playlists/favorites/tracks', authenticate, async (req, res) => {
  const { trackId } = req.body;

  if (!trackId) {
    return res.status(400).json({ error: 'trackId required' });
  }

  try {
    const track = await prisma.track.findFirst({
      where: {
        id: trackId,
        deletedAt: null,
        OR: [{ userId: null }, { userId: req.user.id }, { isPublic: true }]
      }
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // "Любимые треки" is created lazily so new users can save favorites without any setup step.
    let favorites = await prisma.playlist.findFirst({
      where: { userId: req.user.id, isFavorites: true, deletedAt: null }
    });

    if (!favorites) {
      favorites = await prisma.playlist.create({
        data: {
          title: FAVORITES_TITLE,
          description: 'Автоматически созданный плейлист избранного',
          coverUrl: null,
          isFavorites: true,
          userId: req.user.id
        }
      });
    }

    const existing = await prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: {
          playlistId: favorites.id,
          trackId
        }
      }
    });

    if (existing && !existing.deletedAt) {
      return res.json({ success: true, added: false, playlistId: favorites.id });
    }

    if (existing && existing.deletedAt) {
      await prisma.playlistTrack.update({
        where: {
          playlistId_trackId: {
            playlistId: favorites.id,
            trackId
          }
        },
        data: { deletedAt: null, restoredAt: new Date() }
      });

      return res.json({ success: true, added: true, playlistId: favorites.id });
    }

    const maxOrder = await prisma.playlistTrack.aggregate({
      where: { playlistId: favorites.id, deletedAt: null },
      _max: { order: true }
    });

    await prisma.playlistTrack.create({
      data: {
        playlistId: favorites.id,
        trackId,
        order: (maxOrder._max.order ?? -1) + 1
      }
    });

    res.json({ success: true, added: true, playlistId: favorites.id });
  } catch (err) {
    console.error('add favorite track error', err);
    res.status(500).json({ error: 'Could not add track to favorites' });
  }
});

app.get('/api/playlists/favorites', authenticate, async (req, res) => {
  const search = (req.query.search || '').trim();
  const sortBy = ['title', 'createdAt'].includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
  const type = (req.query.type || 'all').trim();

  let favorites = await prisma.playlist.findFirst({
    where: { userId: req.user.id, isFavorites: true, deletedAt: null },
    include: {
      tracks: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
        include: { track: true }
      }
    }
  });

  if (!favorites) {
    favorites = await prisma.playlist.create({
      data: {
        title: FAVORITES_TITLE,
        description: 'Автоматически созданный плейлист избранного',
        coverUrl: null,
        isFavorites: true,
        userId: req.user.id
      },
      include: {
        tracks: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: { track: true }
        }
      }
    });
  }

  let tracks = favorites.tracks.map((item) => item.track).filter((track) => {
    const matchesSearch = !search
      || track.title?.toLowerCase().includes(search.toLowerCase())
      || track.artist?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (type === 'seeded') return track.userId == null;
    if (type === 'uploaded') return track.userId != null;
    if (type === 'public') return track.isPublic;
    if (type === 'private') return !track.isPublic;
    return true;
  });

  tracks = tracks.sort((a, b) => {
    if (sortBy === 'title') {
      const compared = a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' });
      return sortOrder === 'asc' ? compared : -compared;
    }

    const compared = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortOrder === 'asc' ? compared : -compared;
  });

  res.json({
    ...favorites,
    tracks
  });
});

app.delete('/api/playlists/favorites/tracks/:trackId', authenticate, async (req, res) => {
  const { trackId } = req.params;

  const favorites = await prisma.playlist.findFirst({
    where: { userId: req.user.id, isFavorites: true, deletedAt: null }
  });

  if (!favorites) {
    return res.status(404).json({ error: 'Favorites playlist not found' });
  }

  const updated = await prisma.playlistTrack.updateMany({
    where: {
      playlistId: favorites.id,
      trackId,
      deletedAt: null
    },
    data: { deletedAt: new Date() }
  });

  if (!updated.count) {
    return res.status(404).json({ error: 'Track not found in favorites' });
  }

  res.json({ success: true });
});

app.post('/api/playlist-tracks', authenticate, async (req, res) => {
  const { playlistId, trackId, order } = req.body;
  try {
    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist || playlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Playlist not found or access denied' });
    }

    const track = await prisma.track.findFirst({
      where: {
        id: trackId,
        deletedAt: null,
        OR: [{ userId: null }, { userId: req.user.id }, { isPublic: true }]
      }
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Duplicate protection keeps the new picker UX predictable when users save the same track twice.
    const existing = await prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId
        }
      }
    });

    if (existing && !existing.deletedAt) {
      return res.json({ success: true, added: false, duplicate: true, playlistId, trackId });
    }

    const maxOrder = await prisma.playlistTrack.aggregate({
      where: { playlistId, deletedAt: null },
      _max: { order: true }
    });

    const nextOrder = Number.isInteger(order) ? order : (maxOrder._max.order ?? -1) + 1;

    if (existing && existing.deletedAt) {
      const restored = await prisma.playlistTrack.update({
        where: {
          playlistId_trackId: {
            playlistId,
            trackId
          }
        },
        data: {
          deletedAt: null,
          restoredAt: new Date(),
          order: nextOrder
        }
      });

      return res.json({ success: true, added: true, restored: true, playlistTrack: restored });
    }

    const pt = await prisma.playlistTrack.create({ data: { playlistId, trackId, order: nextOrder } });
    res.json({ success: true, added: true, playlistTrack: pt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add track to playlist' });
  }
});

// ------------------------------------------------------------------

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Uploaded file is too large' });
    }

    return res.status(400).json({ error: err.message || 'Upload error' });
  }

  if (err) {
    return res.status(400).json({ error: err.message || 'Request error' });
  }

  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
