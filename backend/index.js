// backend/index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));

// Placeholder config for API keys
const config = require('./config');

// Placeholder: Connect to PostgreSQL/PostGIS here
const db = require('./db');

// --- ROUTES ---

// POST /generateCrawl
app.post('/generateCrawl', (req, res) => {
  // Placeholder: Logic to generate crawl based on user input
  // Use config.GOOGLE_PLACES_API_KEY, config.GOOGLE_MAPS_API_KEY
  res.json({ message: 'Crawl generated (placeholder)', data: {} });
});

// POST /adjustCrawl
app.post('/adjustCrawl', async (req, res) => {
  // Simulate receiving adjustment data from frontend
  const adjustment = req.body;
  // Log adjustment to simulated DB
  const logResult = await db.logUserAdjustment(adjustment);
  // Respond as if adjustment was processed
  res.json({ message: 'Crawl adjusted (placeholder)', data: {}, log: logResult });
});

// GET /places
app.get('/places', (req, res) => {
  // Placeholder: Logic to fetch places based on filters
  res.json({ message: 'Places fetched (placeholder)', data: [] });
});

// POST /landmarks
app.post('/landmarks', async (req, res) => {
  console.log("LANDMARKS ENDPOINT HIT", req.body);
  /*
    Expects body: {
      city: string,
      visitDate: string (YYYY-MM-DD),
      timeStart: string (HHMM),
      timeEnd: string (HHMM),
      budget: number (0-4, optional)
    }
  */
  try {
    const { city, visitDate, timeStart, timeEnd, budget } = req.body;
    const { getEligibleLandmarks } = require('./src/config/utils/landmarks');
    console.log("this is a log");
    const results = await getEligibleLandmarks({ city, visitDate, timeStart, timeEnd, budget });
    console.log(results);
    res.json({ landmarks: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Placeholder: Logging user adjustments
function logUserAdjustment(adjustment) {
  // TODO: Store adjustment in PostgreSQL (user adjustments table)
  console.log('User adjustment logged:', adjustment);
}

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
