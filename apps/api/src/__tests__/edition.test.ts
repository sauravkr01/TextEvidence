import request from 'supertest';
import { app } from '../server';

describe('Edition API', () => {
  let workId: string;

  beforeAll(async () => {
    // Create a work to reference
    const res = await request(app)
      .post('/api/works')
      .send({ title: 'Test Work', author: 'Author', description: 'Desc', language: 'en' })
      .expect(201);
    workId = res.body.id;
  });

  test('POST /api/editions creates an edition', async () => {
    const res = await request(app)
      .post('/api/editions')
      .send({ workId, name: 'Test Edition', language: 'en' })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.workId).toBe(workId);
  });

  test('GET /api/editions returns list', async () => {
    const res = await request(app).get('/api/editions').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/editions/:id returns an edition', async () => {
    // create edition first
    const create = await request(app)
      .post('/api/editions')
      .send({ workId, name: 'Another Edition', language: 'en' })
      .expect(201);
    const editionId = create.body.id;
    const res = await request(app).get(`/api/editions/${editionId}`).expect(200);
    expect(res.body.id).toBe(editionId);
  });

  test('POST /api/editions with non-existent work fails', async () => {
    await request(app)
      .post('/api/editions')
      .send({ workId: 'nonexistent', name: 'Bad Edition' })
      .expect(400);
  });
});
