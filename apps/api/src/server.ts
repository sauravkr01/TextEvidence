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

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`TextEvidence API running on port ${PORT}`);
  });
}