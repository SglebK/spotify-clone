require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

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
const upload = multer({ storage });

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
    res.json({ id: user.id, token, refreshToken });
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
  res.json({ token, refreshToken });
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid token');
    }
    const token = generateAccessToken(user);
    res.json({ token });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
  // clear stored refresh token
  await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
  res.json({ success: true });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const { id, email, timeZone } = req.user;
  res.json({ id, email, timeZone });
});

// ------------------------------------------------------------------
// tracks
app.get('/api/tracks', async (req, res) => {
  // return only "seeded" or public tracks (tracks not uploaded by a specific user)
  const tracks = await prisma.track.findMany({
    where: { deletedAt: null, userId: null }
  });
  res.json(tracks);
});

app.get('/api/tracks/my', authenticate, async (req, res) => {
  const tracks = await prisma.track.findMany({
    where: { userId: req.user.id, deletedAt: null }
  });
  res.json(tracks);
});

app.post('/api/tracks/upload', authenticate, upload.fields([{ name: 'audio' }, { name: 'cover' }]),
  async (req, res) => {
    try {
      const { title, artist } = req.body;
      if (!title || !artist || !req.files?.audio?.length) {
        return res.status(400).json({ error: 'title, artist and audio file required' });
      }
      const audioPath = `/uploads/audio/${req.files.audio[0].filename}`;
      const coverPath = req.files.cover ? `/uploads/covers/${req.files.cover[0].filename}` : null;
      const track = await prisma.track.create({
        data: {
          title,
          artist,
          audioUrl: audioPath,
          coverUrl: coverPath,
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

// ------------------------------------------------------------------
// playlists
app.get('/api/playlists/my', authenticate, async (req, res) => {
  const lists = await prisma.playlist.findMany({
    where: { userId: req.user.id, deletedAt: null }
  });
  res.json(lists);
});

app.post('/api/playlists', authenticate, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const pl = await prisma.playlist.create({
      data: { title, description: description || null, userId: req.user.id }
    });
    res.json(pl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create playlist' });
  }
});

app.get('/api/playlists/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const pl = await prisma.playlist.findUnique({
    where: { id },
    include: { tracks: { include: { track: true } } }
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
  if (input.IsPublic != null) update.isPublic = input.IsPublic;
  if (input.isPublic != null) update.isPublic = input.isPublic;
  try {
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
    // remove any tracks linked to the playlist first to satisfy foreign keys
    await prisma.playlistTrack.deleteMany({ where: { playlistId: id } });
    await prisma.playlist.deleteMany({ where: { id, userId: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('delete playlist error', err);
    res.status(500).json({ error: 'Unable to delete playlist' });
  }
});

app.post('/api/playlist-tracks', authenticate, async (req, res) => {
  const { playlistId, trackId, order } = req.body;
  try {
    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist || playlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Playlist not found or access denied' });
    }
    const pt = await prisma.playlistTrack.create({ data: { playlistId, trackId, order } });
    res.json(pt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add track to playlist' });
  }
});

// ------------------------------------------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});