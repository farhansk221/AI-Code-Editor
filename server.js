const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://ai-code-editor-frontend.vercel.app',
  credentials: true
}));
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Import routes
const reviewRoutes = require('./routes/review');

// Test route to verify Gemini API key - using REST API directly
app.post('/api/test', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Use REST API directly to test - using available model
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                success: false,
                error: data.error?.message || 'API Error',
                details: data
            });
        }

        const answer = data.candidates[0].content.parts[0].text;

        res.json({ 
            success: true,
            answer: answer 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Use routes
app.use('/api/review', reviewRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
