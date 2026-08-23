-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "translator" TEXT,
    "language" TEXT,
    "publicationYear" INTEGER,
    "publisher" TEXT,
    "rights" TEXT,
    "sourceIdentifier" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationPassage" (
    "id" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "sourcePassageId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationPassage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TranslationPassage_translationId_sourcePassageId_key" ON "TranslationPassage"("translationId", "sourcePassageId");

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationPassage" ADD CONSTRAINT "TranslationPassage_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationPassage" ADD CONSTRAINT "TranslationPassage_sourcePassageId_fkey" FOREIGN KEY ("sourcePassageId") REFERENCES "Passage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
