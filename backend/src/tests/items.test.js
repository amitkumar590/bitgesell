const request = require('supertest');
const express = require('express');
const itemsRouter = require('../routes/items');

const app = express();
app.use(express.json()); // Add JSON parsing middleware
app.use('/api/items', itemsRouter);

describe('Items API', () => {
  describe('GET /api/items', () => {
    it('should return paginated items with default pagination', async () => {
      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('totalItems');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.items).toHaveLength(10); // Default limit
    });

    it('should return items for specific page', async () => {
      const response = await request(app)
        .get('/api/items?page=2&limit=5')
        .expect(200);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.items).toHaveLength(5);
    });

    it('should search items by name', async () => {
      const response = await request(app)
        .get('/api/items?q=laptop')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items.every(item => 
        item.name.toLowerCase().includes('laptop')
      )).toBe(true);
    });

    it('should search items by category', async () => {
      const response = await request(app)
        .get('/api/items?q=electronics')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items.every(item => 
        item.category.toLowerCase().includes('electronics')
      )).toBe(true);
    });

    it('should search items by price', async () => {
      const response = await request(app)
        .get('/api/items?q=399')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items.some(item => 
        item.price.toString().includes('399')
      )).toBe(true);
    });

    it('should handle empty search query', async () => {
      const response = await request(app)
        .get('/api/items?q=')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should handle case-insensitive search', async () => {
      const response = await request(app)
        .get('/api/items?q=LAPTOP')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items.every(item => 
        item.name.toLowerCase().includes('laptop')
      )).toBe(true);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a specific item', async () => {
      const response = await request(app)
        .get('/api/items/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('price');
    });

    it('should return 404 for non-existent item', async () => {
      await request(app)
        .get('/api/items/999')
        .expect(404);
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'Test Item',
        category: 'Test Category',
        price: 100
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.category).toBe(newItem.category);
      expect(response.body.price).toBe(newItem.price);
    });
  });
});
