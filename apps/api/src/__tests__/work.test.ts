import request from 'supertest';
import { app } from '../server';
import { prisma } from '../db';

beforeAll(async () => {
  // Clean works table before tests
  await prisma.work.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Work API', () => {
  test('POST /api/works creates a work', async () => {
    const res = await request(app)
      .post('/api/works')
      .send({ title: 'Test Work', author: 'Author', description: 'Desc', language: 'en' })
      .expect(201);
    expect(res.body).toMatchObject({ title: 'Test Work', author: 'Author' });
  });

  test('GET /api/works returns list', async () => {
    const res = await request(app).get('/api/works').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/works/:id returns a work', async () => {
    const work = await prisma.work.findFirst();
    const res = await request(app).get(`/api/works/${work?.id}`).expect(200);
    expect(res.body).toMatchObject({ id: work?.id, title: work?.title });
  });
});
