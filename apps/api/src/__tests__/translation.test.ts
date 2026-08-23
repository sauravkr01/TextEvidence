import request from 'supertest';
import { app } from '../server';
import { prisma } from '../db';

beforeAll(async () => {
  await prisma.translationPassage.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.passage.deleteMany();
  await prisma.edition.deleteMany();
  await prisma.work.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Translation API', () => {
  test('POST /api/translations creates a translation with valid work and edition', async () => {
    const work = await prisma.work.create({ data: { title: 'Test Work', author: 'Author', description: 'Desc', language: 'en' } });
    const edition = await prisma.edition.create({ data: { workId: work.id, name: 'Test Edition' } });
    const res = await request(app).post('/api/translations').send({ workId: work.id, editionId: edition.id, translator: 'John Doe', language: 'fr' }).expect(201);
    expect(res.body).toMatchObject({ workId: work.id, editionId: edition.id, translator: 'John Doe' });
  });

  test('POST /api/translations returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/translations').send({}).expect(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/translations returns 400 when work does not exist', async () => {
    // Create a valid edition linked to a real work
    const realWork = await prisma.work.create({ data: { title: 'Real Work', author: 'A' } });
    const edition = await prisma.edition.create({ data: { workId: realWork.id, name: 'Valid Edition' } });
    const res = await request(app).post('/api/translations').send({ workId: 'nonexistent', editionId: edition.id }).expect(400);
    expect(res.body.error).toMatch(/Work/);
  });


  test('POST /api/translations returns 400 when edition does not exist', async () => {
    const work = await prisma.work.create({ data: { title: 'Work2', author: 'Author' } });
    const res = await request(app).post('/api/translations').send({ workId: work.id, editionId: 'nonexistent' }).expect(400);
    expect(res.body.error).toMatch(/Edition/);
  });

  test('POST /api/translations returns 400 when edition does not belong to work', async () => {
    const work1 = await prisma.work.create({ data: { title: 'W1' } });
    const work2 = await prisma.work.create({ data: { title: 'W2' } });
    const edition = await prisma.edition.create({ data: { workId: work2.id, name: 'E' } });
    const res = await request(app).post('/api/translations').send({ workId: work1.id, editionId: edition.id }).expect(400);
    expect(res.body.error).toMatch(/Edition does not belong/);
  });

  test('GET /api/translations returns list', async () => {
    const res = await request(app).get('/api/translations').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/translations/:id returns a translation', async () => {
    const work = await prisma.work.create({ data: { title: 'W3' } });
    const edition = await prisma.edition.create({ data: { workId: work.id, name: 'E3' } });
    const translation = await prisma.translation.create({ data: { workId: work.id, editionId: edition.id, language: 'es' } });
    const res = await request(app).get(`/api/translations/${translation.id}`).expect(200);
    expect(res.body).toMatchObject({ id: translation.id, workId: work.id, editionId: edition.id });
  });

  test('GET /api/translations/:id with unknown ID returns 404', async () => {
    const res = await request(app).get('/api/translations/nonexistent-id').expect(404);
    expect(res.body).toHaveProperty('error');
  });
});
