const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/tracks', async (req, res) => {
    const tracks = await prisma.track.findMany();
    res.json(tracks);
});

app.post('/tracks', async (req, res) => {
    const { title, artist, url, cover } = req.body;

    const track = await prisma.track.create({
        data: { title, artist, url, cover }
    });

    res.json(track);
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});