-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "companyName" TEXT NOT NULL,
    "logoPath" TEXT,
    "setupDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Blip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quadrant" TEXT NOT NULL,
    "ring" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEvaluatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BlipHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blipId" TEXT NOT NULL,
    "fromRing" TEXT NOT NULL,
    "toRing" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT NOT NULL DEFAULT 'system',
    CONSTRAINT "BlipHistory_blipId_fkey" FOREIGN KEY ("blipId") REFERENCES "Blip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Blip_number_key" ON "Blip"("number");

-- CreateIndex
CREATE INDEX "Blip_quadrant_ring_idx" ON "Blip"("quadrant", "ring");
