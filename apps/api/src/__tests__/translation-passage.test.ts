import request from 'supertest';
import { app } from '../server';
import { prisma } from '../db';
import { randomUUID as uuidv4 } from 'crypto';

let workId: string;
let editionId: string;
let passageId: string;
let translationId: string;
let translationPassageId: string;

beforeAll(async () => {
  // Clean up tables for isolation
  await prisma.translationPassage.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.passage.deleteMany();
  await prisma.edition.deleteMany();
  await prisma.work.deleteMany();

  const work = await prisma.work.create({
    data: { title: 'Test Work', author: 'Author', description: 'Desc', language: 'en' },
  });
  workId = work.id;

  const edition = await prisma.edition.create({
    data: { workId, name: 'Test Edition', language: 'en' },
  });
  editionId = edition.id;

  const passage = await prisma.passage.create({
    data: { editionId, reference: 'ref1', originalText: 'orig', translatedText: 'trans' },
  });
  passageId = passage.id;

  const translation = await prisma.translation.create({
    data: { workId, editionId, language: 'fr' },
  });
  translationId = translation.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('TranslationPassage API', () => {
  test('POST creates a translation passage successfully', async () => {
    const res = await request(app)
      .post('/api/translation-passages')
      .send({ translationId, sourcePassageId: passageId, text: 'some text', language: 'fr' })
      .expect(201);
    expect(res.body).toMatchObject({ translationId, sourcePassageId: passageId, text: 'some text' });
    translationPassageId = res.body.id;
  });

  test('GET list returns created translation passage', async () => {
    const res = await request(app).get('/api/translation-passages').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find((tp: any) => tp.id === translationPassageId);
    expect(found).toBeDefined();
  });

  test('GET by ID returns the translation passage', async () => {
    const res = await request(app).get(`/api/translation-passages/${translationPassageId}`).expect(200);
    expect(res.body.id).toBe(translationPassageId);
  });

  test('GET unknown ID returns 404', async () => {
    await request(app).get(`/api/translation-passages/${uuidv4()}`).expect(404);
  });

  test('POST missing translationId returns 400', async () => {
    await request(app)
      .post('/api/translation-passages')
      .send({ sourcePassageId: passageId, text: 't', language: 'fr' })
      .expect(400);
  });

  test('POST missing sourcePassageId returns 400', async () => {
    await request(app)
      .post('/api/translation-passages')
      .send({ translationId, text: 't', language: 'fr' })
      .expect(400);
  });

  test('POST missing text returns 400', async () => {
    await request(app)
      .post('/api/translation-passages')
      .send({ translationId, sourcePassageId: passageId, language: 'fr' })
      .expect(400);
  });

  test('POST non-existent translationId returns 400', async () => {
    await request(app)
      .post('/api/translation-passages')
      .send({ translationId: uuidv4(), sourcePassageId: passageId, text: 't', language: 'fr' })
      .expect(400);
  });

  test('POST non-existent sourcePassageId returns 400', async () => {
    await request(app)
      .post('/api/translation-passages')
      .send({ translationId, sourcePassageId: uuidv4(), text: 't', language: 'fr' })
      .expect(400);
  });

  test('POST with mismatched work returns 400', async () => {
    const otherWork = await prisma.work.create({ data: { title: 'Other', author: 'A', description: 'D', language: 'en' } });
    const otherEdition = await prisma.edition.create({ data: { workId: otherWork.id, name: 'Other Edition', language: 'en' } });
    const otherPassage = await prisma.passage.create({ data: { editionId: otherEdition.id, reference: 'ref2', originalText: 'o', translatedText: 't' } });
    await request(app)
      .post('/api/translation-passages')
      .send({ translationId, sourcePassageId: otherPassage.id, text: 't', language: 'fr' })
      .expect(400);
  });

  test('POST duplicate translationId & sourcePassageId returns 400', async () => {
    await request(app)
      .post('/api/translation-passages')
      .send({ translationId, sourcePassageId: passageId, text: 'duplicate', language: 'fr' })
      .expect(400);
  });
});
