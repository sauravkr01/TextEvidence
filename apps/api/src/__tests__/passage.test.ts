import request from 'supertest';
import { app } from '../server';

describe('Passage API', () => {
  let workId: string;
  let editionId: string;

  beforeAll(async () => {
    // create a work
    const workRes = await request(app)
      .post('/api/works')
      .send({ title: 'Work for passages', author: 'Author', description: 'Desc', language: 'en' })
      .expect(201);
    workId = workRes.body.id;
    // create an edition linked to the work
    const editionRes = await request(app)
      .post('/api/editions')
      .send({ workId, name: 'Edition for passages', language: 'en' })
      .expect(201);
    editionId = editionRes.body.id;
  });

  test('POST /api/passages creates a passage', async () => {
    const res = await request(app)
      .post('/api/passages')
      .send({ editionId, reference: '1:1', originalText: 'Original', translatedText: 'Translated' })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.editionId).toBe(editionId);
    expect(res.body.reference).toBe('1:1');
  });

  test('GET /api/passages returns list', async () => {
    const res = await request(app).get('/api/passages').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/passages/:id returns a passage', async () => {
    const create = await request(app)
      .post('/api/passages')
      .send({ editionId, reference: '2:1', originalText: 'Orig2' })
      .expect(201);
    const passageId = create.body.id;
    const res = await request(app).get(`/api/passages/${passageId}`).expect(200);
    expect(res.body.id).toBe(passageId);
  });

  test('POST with non‑existent edition fails', async () => {
    await request(app)
      .post('/api/passages')
      .send({ editionId: 'nonexistent', reference: 'x' })
      .expect(400);
  });

  test('POST missing required fields fails', async () => {
    await request(app)
      .post('/api/passages')
      .send({ editionId }) // missing reference
      .expect(400);
  });
});
