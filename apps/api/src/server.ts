import express from "express";
import cors from "cors";
import { prisma } from "./db";

const app = express();

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TextEvidence API running on port ${PORT}`);
});