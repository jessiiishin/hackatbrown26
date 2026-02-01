// backend/db.js
// PostgreSQL connection with JSON file fallback for development

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// File-based storage fallback
const DATA_FILE = path.join(__dirname, 'crawls_data.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading data file:', err.message);
  }
  return { crawls: [] };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving data file:', err.message);
  }
}

// Check if PostgreSQL is available
let pool = null;
let usePostgres = false;

try {
  const { Pool } = require('pg');
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    usePostgres = true;
  }
} catch (err) {
  console.log('PostgreSQL not available, using file-based storage');
}

// Initialize the crawls table (PostgreSQL) or file storage
async function initializeDatabase() {
  if (usePostgres && pool) {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS crawls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        budget VARCHAR(10),
        duration INTEGER,
        dietary_preferences TEXT[],
        cuisines TEXT[],
        crawl_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_crawls_user_id ON crawls(user_id);
    `;
    
    try {
      await pool.query(createTableQuery);
      console.log('Database initialized: PostgreSQL crawls table ready');
    } catch (err) {
      console.error('PostgreSQL initialization error:', err.message);
      console.log('Falling back to file-based storage');
      usePostgres = false;
    }
  } else {
    // Ensure data file exists
    if (!fs.existsSync(DATA_FILE)) {
      saveData({ crawls: [] });
    }
    console.log('Database initialized: Using file-based storage at', DATA_FILE);
  }
}

// Get all crawls for a user
async function getCrawlsByUserId(userId) {
  if (usePostgres && pool) {
    const result = await pool.query(
      'SELECT * FROM crawls WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  } else {
    const data = loadData();
    return data.crawls.filter(c => c.user_id === userId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
}

// Get a single crawl by ID
async function getCrawlById(crawlId, userId) {
  if (usePostgres && pool) {
    const result = await pool.query(
      'SELECT * FROM crawls WHERE id = $1 AND user_id = $2',
      [crawlId, userId]
    );
    return result.rows[0] || null;
  } else {
    const data = loadData();
    return data.crawls.find(c => c.id === crawlId && c.user_id === userId) || null;
  }
}

// Create a new crawl
async function createCrawl({ userId, name, city, budget, duration, dietaryPreferences, cuisines, crawlData }) {
  if (usePostgres && pool) {
    const result = await pool.query(
      `INSERT INTO crawls (user_id, name, city, budget, duration, dietary_preferences, cuisines, crawl_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, name, city, budget, duration, dietaryPreferences || [], cuisines || [], crawlData]
    );
    return result.rows[0];
  } else {
    const data = loadData();
    const newCrawl = {
      id: crypto.randomUUID(),
      user_id: userId,
      name,
      city,
      budget,
      duration,
      dietary_preferences: dietaryPreferences || [],
      cuisines: cuisines || [],
      crawl_data: crawlData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    data.crawls.push(newCrawl);
    saveData(data);
    return newCrawl;
  }
}

// Update an existing crawl
async function updateCrawl(crawlId, userId, { name, crawlData }) {
  if (usePostgres && pool) {
    const result = await pool.query(
      `UPDATE crawls 
       SET name = COALESCE($1, name), 
           crawl_data = COALESCE($2, crawl_data),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name, crawlData, crawlId, userId]
    );
    return result.rows[0] || null;
  } else {
    const data = loadData();
    const index = data.crawls.findIndex(c => c.id === crawlId && c.user_id === userId);
    if (index === -1) return null;
    
    if (name) data.crawls[index].name = name;
    if (crawlData) data.crawls[index].crawl_data = crawlData;
    data.crawls[index].updated_at = new Date().toISOString();
    
    saveData(data);
    return data.crawls[index];
  }
}

// Delete a crawl
async function deleteCrawl(crawlId, userId) {
  if (usePostgres && pool) {
    const result = await pool.query(
      'DELETE FROM crawls WHERE id = $1 AND user_id = $2 RETURNING id',
      [crawlId, userId]
    );
    return result.rowCount > 0;
  } else {
    const data = loadData();
    const initialLength = data.crawls.length;
    data.crawls = data.crawls.filter(c => !(c.id === crawlId && c.user_id === userId));
    if (data.crawls.length < initialLength) {
      saveData(data);
      return true;
    }
    return false;
  }
}

// Duplicate a crawl
async function duplicateCrawl(crawlId, userId) {
  const original = await getCrawlById(crawlId, userId);
  if (!original) return null;
  
  return await createCrawl({
    userId,
    name: `${original.name} (Copy)`,
    city: original.city,
    budget: original.budget,
    duration: original.duration,
    dietaryPreferences: original.dietary_preferences,
    cuisines: original.cuisines,
    crawlData: original.crawl_data,
  });
}

// Legacy function for adjustments
async function logUserAdjustment(adjustment) {
  console.log('Simulated DB log:', adjustment);
  return { success: true, adjustment };
}

module.exports = {
  pool,
  initializeDatabase,
  getCrawlsByUserId,
  getCrawlById,
  createCrawl,
  updateCrawl,
  deleteCrawl,
  duplicateCrawl,
  logUserAdjustment,
};
