const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (intentionally sync to highlight blocking issue)
async function readData() {
  try {
    const raw = await fs.promises.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading data:", err);
    throw err;
  }
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { page = 1, limit = 10, q } = req.query;
    
    let results = data;

    // Apply search filter if query parameter is provided
    if (q && q.trim()) {
      const searchTerm = q.toLowerCase().trim();
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.price.toString().includes(searchTerm)
      );
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / limitNum);
    const offset = (pageNum - 1) * limitNum;
    
    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limitNum);

    // Return paginated response with metadata
    res.json({
      items: paginatedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await fs.promises.writeFile(
      DATA_PATH,
      JSON.stringify(data, null, 2),
      "utf8"
    );
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;