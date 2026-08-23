import express from "express";
import cors from "cors";
import { prisma } from "./db";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      service: "TextEvidence API",
      database: "connected",
    });
  } catch {
    res.status(500).json({
      status: "error",
      service: "TextEvidence API",
      database: "disconnected",
    });
  }
});
// Work routes
app.get("/api/works", async (req, res) => {
  try {
    const works = await prisma.work.findMany();
    res.json(works);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/works/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const work = await prisma.work.findUnique({ where: { id } });
    if (!work) {
      return res.status(404).json({ error: "Work not found" });
    }
    res.json(work);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/works", async (req, res) => {
  const { title, author, description, language } = req.body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "'title' is required and must be a string" });
  }
  try {
    const newWork = await prisma.work.create({
      data: { title, author, description, language },
    });
    res.status(201).json(newWork);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Edition routes
app.get("/api/editions", async (req, res) => {
  try {
    const editions = await prisma.edition.findMany();
    res.json(editions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/editions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const edition = await prisma.edition.findUnique({ where: { id } });
    if (!edition) {
      return res.status(404).json({ error: "Edition not found" });
    }
    res.json(edition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/editions", async (req, res) => {
  const { workId, name, language, translator, publisher, year, isbn } = req.body;
  if (!workId || typeof workId !== "string") {
    return res.status(400).json({ error: "'workId' is required and must be a string" });
  }
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "'name' is required and must be a string" });
  }
  try {
    const work = await prisma.work.findUnique({ where: { id: workId } });
    if (!work) {
      return res.status(400).json({ error: "Referenced Work does not exist" });
    }
    const newEdition = await prisma.edition.create({
      data: { workId, name, language, translator, publisher, year, isbn },
    });
    res.status(201).json(newEdition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Passage routes
app.get("/api/passages", async (req, res) => {
  try {
    const passages = await prisma.passage.findMany();
    res.json(passages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/passages/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const passage = await prisma.passage.findUnique({ where: { id } });
    if (!passage) {
      return res.status(404).json({ error: "Passage not found" });
    }
    res.json(passage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/passages", async (req, res) => {
  const { editionId, reference, originalText, translatedText, context, verificationStatus } = req.body;
  if (!editionId || typeof editionId !== "string") {
    return res.status(400).json({ error: "'editionId' is required and must be a string" });
  }
  if (!reference || typeof reference !== "string") {
    return res.status(400).json({ error: "'reference' is required and must be a string" });
  }
  try {
    const edition = await prisma.edition.findUnique({ where: { id: editionId } });
    if (!edition) {
      return res.status(400).json({ error: "Referenced Edition does not exist" });
    }
    const newPassage = await prisma.passage.create({
      data: { editionId, reference, originalText, translatedText, context, verificationStatus },
    });
    res.status(201).json(newPassage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Translation routes
app.get("/api/translations", async (req, res) => {
  try {
    const translations = await prisma.translation.findMany();
    res.json(translations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/translations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const translation = await prisma.translation.findUnique({ where: { id } });
    if (!translation) {
      return res.status(404).json({ error: "Translation not found" });
    }
    res.json(translation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/translations", async (req, res) => {
  const { workId, editionId, translator, language, publicationYear, publisher, rights, sourceIdentifier, notes } = req.body;
  if (!workId || typeof workId !== "string") {
    return res.status(400).json({ error: "'workId' is required and must be a string" });
  }
  if (!editionId || typeof editionId !== "string") {
    return res.status(400).json({ error: "'editionId' is required and must be a string" });
  }
  try {
    const work = await prisma.work.findUnique({ where: { id: workId } });
    if (!work) {
      return res.status(400).json({ error: "Referenced Work does not exist" });
    }
    const edition = await prisma.edition.findUnique({ where: { id: editionId } });
    if (!edition) {
      return res.status(400).json({ error: "Referenced Edition does not exist" });
    }
    if (edition.workId !== workId) {
      return res.status(400).json({ error: "Edition does not belong to the specified Work" });
    }
    const newTranslation = await prisma.translation.create({
      data: {
        workId,
        editionId,
        translator,
        language,
        publicationYear,
        publisher,
        rights,
        sourceIdentifier,
        notes,
      },
    });
    res.status(201).json(newTranslation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`TextEvidence API running on port ${PORT}`);
  });
}