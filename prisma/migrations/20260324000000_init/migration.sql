-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "platform" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "description" TEXT,
    "modelSnapshot" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProviderConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "apiKeyEncrypted" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ModelProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerConfigId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "capabilities" JSONB NOT NULL,
    "roles" JSONB NOT NULL,
    "quality" TEXT,
    "latency" TEXT,
    "cost" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isDefaultAnalysis" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultPlanning" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultHeroImage" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultDetailImage" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultImageEdit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ModelProfile_providerConfigId_fkey" FOREIGN KEY ("providerConfigId") REFERENCES "ProviderConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "sectionId" TEXT,
    "type" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductAsset_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "PageSection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "rawResult" JSONB NOT NULL,
    "normalizedResult" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "copy" TEXT NOT NULL,
    "visualPrompt" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "currentImageAssetId" TEXT,
    "editableData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PageSection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PageSection_currentImageAssetId_fkey" FOREIGN KEY ("currentImageAssetId") REFERENCES "ProductAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SectionVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "promptSnapshot" JSONB NOT NULL,
    "copySnapshot" JSONB NOT NULL,
    "imageAssetId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SectionVersion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "PageSection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SectionVersion_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "ProductAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GenerationTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "sectionId" TEXT,
    "taskType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "inputPayload" JSONB,
    "outputPayload" JSONB,
    "errorMessage" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GenerationTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GenerationTask_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "PageSection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ModelProfile_providerConfigId_idx" ON "ModelProfile"("providerConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelProfile_providerConfigId_modelId_key" ON "ModelProfile"("providerConfigId", "modelId");

-- CreateIndex
CREATE INDEX "ProductAsset_projectId_sortOrder_idx" ON "ProductAsset"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductAsset_sectionId_idx" ON "ProductAsset"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAnalysis_projectId_key" ON "ProductAnalysis"("projectId");

-- CreateIndex
CREATE INDEX "PageSection_projectId_order_idx" ON "PageSection"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "PageSection_projectId_sectionKey_key" ON "PageSection"("projectId", "sectionKey");

-- CreateIndex
CREATE INDEX "SectionVersion_sectionId_createdAt_idx" ON "SectionVersion"("sectionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SectionVersion_sectionId_versionNumber_key" ON "SectionVersion"("sectionId", "versionNumber");

-- CreateIndex
CREATE INDEX "GenerationTask_projectId_createdAt_idx" ON "GenerationTask"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationTask_sectionId_createdAt_idx" ON "GenerationTask"("sectionId", "createdAt");
