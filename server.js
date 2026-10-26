require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Multer for image uploads (in-memory, no disk storage needed for MVP)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', app: 'Avarion' });
});

// AI Recommendations — proxy to Gemini API
app.post('/api/recommend', async (req, res) => {
  try {
    const { event, style, budget, bodyType, skinTone, gender } = req.body;

    const apiKey = req.headers['x-gemini-key'] || GEMINI_API_KEY;

    if (!apiKey) {
      // Return mock data if no API key configured
      return res.json(getMockRecommendations(event, style, budget));
    }

    const prompt = buildFashionPrompt({ event, style, budget, bodyType, skinTone, gender });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return res.json(getMockRecommendations(event, style, budget));
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON from Gemini response
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return res.json(parsed);
      } catch {
        // fallthrough to mock
      }
    }

    return res.json(getMockRecommendations(event, style, budget));
  } catch (err) {
    console.error('Recommend error:', err);
    res.json(getMockRecommendations(req.body.event, req.body.style, req.body.budget));
  }
});

// Trending looks endpoint
app.get('/api/trends', async (req, res) => {
  try {
    const { season = 'summer', gender = 'all' } = req.query;

    const apiKey = req.headers['x-gemini-key'] || GEMINI_API_KEY;

    if (!apiKey) {
      return res.json(getMockTrends());
    }

    const prompt = `You are a fashion trend expert. List 6 trending fashion looks for ${season} 2026 for ${gender}. 
    For each look provide: name, description (1 sentence), key_pieces (array of 3 items), color_palette (array of 3 hex colors), vibe (1 word like "Ethereal", "Bold", "Minimal").
    Respond ONLY with a JSON array, no explanation.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) return res.json(getMockTrends());

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return res.json(JSON.parse(jsonMatch[1]));
      } catch { /* fallthrough */ }
    }
    return res.json(getMockTrends());
  } catch (err) {
    console.error('Trends error:', err);
    res.json(getMockTrends());
  }
});

// Image upload endpoint (stores in memory, returns session ID)
app.post('/api/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const sessionId = `session_${Date.now()}`;
  // In production: save to cloud storage. For MVP: acknowledge receipt.
  res.json({ success: true, sessionId, message: 'Photo received. Mannequin will be personalized.' });
});

// AI photo analysis (Computer Vision) endpoint
app.post('/api/analyze-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Convert file buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const apiKey = req.headers['x-gemini-key'] || GEMINI_API_KEY;

    if (!apiKey) {
      // Mock computer vision analysis if no API key is configured
      console.log('No Gemini API key. Returning mock computer vision analysis.');
      return setTimeout(() => {
        res.json({
          skinTone: 'Medium',
          bodyType: 'Hourglass',
          gender: 'Female',
          confidence: 0.92,
          message: 'Mock analysis successful (Gemini API key not configured)'
        });
      }, 1500); // simulate network latency
    }

    const prompt = `You are a fashion and appearance analysis AI. Analyze the person in this photo.
    Determine their:
    1. Skin Tone. Select from these exact categories: Fair, Light, Medium, Tan, Dark, Deep.
    2. Body Shape/Type. Select from these exact categories: Hourglass, Pear, Apple, Rectangle, Inverted Triangle.
    3. Gender Expression. Select from these exact categories: Female, Male, Non-binary.

    Respond ONLY with a valid JSON object in this exact format:
    {
      "skinTone": "Medium",
      "bodyType": "Hourglass",
      "gender": "Female",
      "confidence": 0.95
    }
    Do not add any markdown, comments, or extra text. Output ONLY the JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                  }
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini Vision API error:', err);
      return res.json({ skinTone: 'Light', bodyType: 'Hourglass', gender: 'Female', confidence: 0.5, error: 'API Error' });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return res.json(parsed);
      } catch (err) {
        console.error('Failed to parse Gemini Vision response:', text);
      }
    }

    // Default fallback
    res.json({ skinTone: 'Light', bodyType: 'Hourglass', gender: 'Female', confidence: 0.5 });
  } catch (err) {
    console.error('Analyze photo error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Affiliate link builder
app.post('/api/shop-links', (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

  const links = items.map(item => ({
    item: item.name,
    category: item.category,
    links: {
      amazon: buildAmazonLink(item.name, item.category),
      flipkart: buildFlipkartLink(item.name),
      myntra: buildMyntraLink(item.name),
      ajio: buildAjioLink(item.name),
      asos: buildAsosLink(item.name),
    }
  }));

  res.json({ links });
});

// ─── Helper Functions ─────────────────────────────────────────────────────────

function buildFashionPrompt({ event, style, budget, bodyType, skinTone, gender }) {
  return `You are a world-class fashion stylist AI named "Ava". A user needs a complete outfit recommendation.

User Profile:
- Event/Occasion: ${event || 'casual day out'}
- Style Preference: ${style || 'modern chic'}
- Budget: ${budget || 'INR 2000-5000'}
- Body Type: ${bodyType || 'average'}
- Skin Tone: ${skinTone || 'medium'}
- Gender: ${gender || 'female'}

Create a complete makeover recommendation. Respond ONLY with valid JSON in this exact format:
\`\`\`json
{
  "stylist_note": "A warm, personalized 2-sentence message from Ava about this look",
  "outfit": {
    "top": { "name": "Item name", "description": "Brief description", "color": "#hexcolor", "price_range": "INR XXX-XXX" },
    "bottom": { "name": "Item name", "description": "Brief description", "color": "#hexcolor", "price_range": "INR XXX-XXX" },
    "dress": null,
    "outerwear": { "name": "Item name", "description": "Brief description", "color": "#hexcolor", "price_range": "INR XXX-XXX" }
  },
  "footwear": { "name": "Item name", "description": "Brief description", "color": "#hexcolor", "price_range": "INR XXX-XXX" },
  "accessories": [
    { "name": "Item name", "type": "jewelry/bag/scarf/belt", "description": "Brief description", "color": "#hexcolor" },
    { "name": "Item name", "type": "jewelry/bag/scarf/belt", "description": "Brief description", "color": "#hexcolor" }
  ],
  "makeup": {
    "base": "Foundation/BB cream recommendation",
    "eyes": "Eye makeup look name and description",
    "lips": "Lip color and finish",
    "blush": "Blush color suggestion",
    "overall_look": "Name of the makeup look (e.g., 'Dewy Natural Glow')"
  },
  "color_story": ["#hex1", "#hex2", "#hex3"],
  "style_tip": "One actionable styling tip for this specific outfit"
}
\`\`\``;
}

function getMockRecommendations(event = 'party', style = 'modern', budget = 'INR 2000-5000') {
  return {
    stylist_note: `For your ${event}, I've curated a stunning ${style} look that perfectly balances elegance and comfort. This outfit will make you feel confident and camera-ready all night long!`,
    outfit: {
      top: { name: 'Draped Satin Blouse', description: 'Luxurious fluid satin with a relaxed drape', color: '#C9A96E', price_range: 'INR 800-1500' },
      bottom: { name: 'High-Waist Palazzo Pants', description: 'Wide-leg silhouette with flowy fabric', color: '#1A1A2E', price_range: 'INR 1200-2000' },
      dress: null,
      outerwear: { name: 'Cropped Blazer', description: 'Structured single-button blazer', color: '#16213E', price_range: 'INR 1500-3000' }
    },
    footwear: { name: 'Block Heel Mules', description: 'Open-toe block heels with ankle strap', color: '#C9A96E', price_range: 'INR 1000-2500' },
    accessories: [
      { name: 'Statement Ear Cuffs', type: 'jewelry', description: 'Gold-toned geometric ear cuffs', color: '#FFD700' },
      { name: 'Mini Quilted Clutch', type: 'bag', description: 'Compact evening clutch in metallic finish', color: '#C0C0C0' }
    ],
    makeup: {
      base: 'Light-coverage dewy foundation with SPF',
      eyes: 'Subtle champagne shimmer with winged liner',
      lips: 'Berry-rose satin finish lipstick',
      blush: 'Warm peach blush on cheekbones',
      overall_look: 'Golden Hour Glam'
    },
    color_story: ['#C9A96E', '#1A1A2E', '#FFD700'],
    style_tip: 'Tuck the blouse half into the palazzo for a polished yet relaxed silhouette — it elongates the waist beautifully.'
  };
}

function getMockTrends() {
  return [
    { name: 'Quiet Luxury', description: 'Understated elegance with premium neutral tones and minimal branding.', key_pieces: ['Cashmere sweater', 'Tailored trousers', 'Leather loafers'], color_palette: ['#D4C5A9', '#8B7355', '#2C2C2C'], vibe: 'Refined' },
    { name: 'Y2K Revival', description: 'Bold metallics and playful prints from the early 2000s are back.', key_pieces: ['Cargo pants', 'Butterfly clips', 'Platform sneakers'], color_palette: ['#FF69B4', '#7DF9FF', '#FFD700'], vibe: 'Playful' },
    { name: 'Dopamine Dressing', description: 'Wear joy — saturated colors and fun prints to boost your mood.', key_pieces: ['Color-block dress', 'Neon accessories', 'Bold earrings'], color_palette: ['#FF6B35', '#FFE66D', '#4ECDC4'], vibe: 'Joyful' },
    { name: 'Cottagecore', description: 'Romantic pastoral aesthetics with floral prints and natural textures.', key_pieces: ['Floral midi dress', 'Wicker basket bag', 'Mary Jane flats'], color_palette: ['#F5CBA7', '#82C45D', '#E8B4B8'], vibe: 'Dreamy' },
    { name: 'Cyber Punk Edge', description: 'Dark techwear meets futuristic accessories and neon accents.', key_pieces: ['Utility cargo vest', 'Combat boots', 'LED accessories'], color_palette: ['#0D0D0D', '#9B59B6', '#00FFFF'], vibe: 'Edgy' },
    { name: 'Boho Chic', description: 'Free-spirited layers with earth tones, fringe, and artisan details.', key_pieces: ['Tiered maxi skirt', 'Crochet top', 'Suede ankle boots'], color_palette: ['#C19A6B', '#8B4513', '#F5DEB3'], vibe: 'Free' },
  ];
}

function buildAmazonLink(name, category) {
  const q = encodeURIComponent(`${name} ${category || ''} women fashion`.trim());
  return `https://www.amazon.in/s?k=${q}&tag=avarion-21`;
}
function buildFlipkartLink(name) {
  const q = encodeURIComponent(name);
  return `https://www.flipkart.com/search?q=${q}&affid=avarion`;
}
function buildMyntraLink(name) {
  const q = encodeURIComponent(name);
  return `https://www.myntra.com/${q.toLowerCase().replace(/%20/g, '-')}`;
}
function buildAjioLink(name) {
  const q = encodeURIComponent(name);
  return `https://www.ajio.com/search/?text=${q}`;
}
function buildAsosLink(name) {
  const q = encodeURIComponent(name);
  return `https://www.asos.com/search/?q=${q}`;
}

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎨 Avarion server running at http://localhost:${PORT}`);
  console.log(`🔑 Gemini API: ${GEMINI_API_KEY ? '✅ Configured' : '⚠️  Not set (using mock data)'}`);
  console.log(`📖 API docs: http://localhost:${PORT}/api/health\n`);
});
