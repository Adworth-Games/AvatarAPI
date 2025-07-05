const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const colors = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFC0CB', // Pink
    '#FFFFFF', // White (default)
];

const customBackgrounds = {
    CUSTOM1: 'YOURURL',
    CUSTOM2: 'YOURURL',
};

app.get('/', (req, res) => {
    res.redirect('https://github.com/Adworth-Games/AvatarAPI');
});

app.get('/avatar/:userId', async (req, res) => {
    const userId = req.params.userId;
    const background = req.query.bg;

    try {
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
        const avatarUrl = response.data.data[0].imageUrl;

        // Create a canvas to draw the avatar with a random background color
        const canvas = createCanvas(420, 420);
        const ctx = canvas.getContext('2d');

        // Select a random color from the colors array
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = randomColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load and draw the custom background image if specified
        let backgroundImage;
        if (background && customBackgrounds[background]) {
            backgroundImage = customBackgrounds[background];
            const bgImage = await loadImage(backgroundImage);
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        }

        // Load the avatar image and draw it
        const avatarImage = await loadImage(avatarUrl);
        ctx.drawImage(avatarImage, 0, 0, canvas.width, canvas.height);

        // Set response type to PNG
        res.set('Content-Type', 'image/png');
        canvas.toBuffer((err, buffer) => {
            if (err) {
                console.error('Error creating image buffer:', err);
                return res.status(500).send('Error creating image');
            }
            res.send(buffer);
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
