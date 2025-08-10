const express = require('express');
const fs = require('fs');
const path = require('path');
const { mean } = require('../utils/stats');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedStats = null;
let lastModified = null;

// Function to recompute stats
async function computeStats() {
  const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);

  cachedStats = {
    total: items.length,
    averagePrice: mean(items.map(item => item.price))
  };
}

// Watch file for changes to invalidate cache
fs.watch(DATA_PATH, async (eventType) => {
  if (eventType === 'change') {
    console.log('Data file changed. Refreshing stats cache...');
    await computeStats();
  }
});

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const stat = await fs.promises.stat(DATA_PATH);

    // If never computed or file modified since last cache, recompute
    if (!cachedStats || !lastModified || stat.mtimeMs !== lastModified) {
      lastModified = stat.mtimeMs;
      await computeStats();
    }

    res.json(cachedStats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;