const request = require('supertest');
const app = require('../src/app');

describe('API Integration Tests', () => {
  test('GET /health devrait retourner un statut healthy', async () => {
    const response = await request(app)
      .get('/health')  // ❌ Supprimez la parenthèse fermante
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('service');
  });

  test('GET /api/calculator/operations devrait retourner la liste des opérations', async () => {
    const response = await request(app)
      .get('/api/calculator/operations')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.operations).toBeInstanceOf(Array);
    expect(response.body.operations).toHaveLength(4);
  });

  test('POST /api/calculator/calculate avec add devrait retourner le résultat', async () => {
    const response = await request(app)
      .post('/api/calculator/calculate')
      .send({ operation: 'add', a: 5, b: 3 })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      operation: 'add',
      a: 5,
      b: 3,
      result: 8,
      timestamp: expect.any(String)
    });
  });

  test('POST /api/calculator/calculate avec divide par zéro devrait échouer', async () => {
    const response = await request(app)
      .post('/api/calculator/calculate')
      .send({ operation: 'divide', a: 5, b: 0 })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.error).toBe('Division par zéro');
  });

  test('Route inexistante devrait retourner 404', async () => {
    const response = await request(app)
      .get('/inexistant')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body.error).toBe('Route non trouvée');
  });
});