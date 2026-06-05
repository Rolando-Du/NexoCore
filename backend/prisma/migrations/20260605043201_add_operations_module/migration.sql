-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('TASK', 'WORK_ORDER', 'INCIDENT', 'INSPECTION', 'SERVICE_REQUEST');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('DRAFT', 'PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'ASSIGN';
ALTER TYPE "AuditAction" ADD VALUE 'STATUS_CHANGE';

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT,
    "type" "OperationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "OperationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationStatusHistory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "fromStatus" "OperationStatus",
    "toStatus" "OperationStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Operation_tenantId_idx" ON "Operation"("tenantId");

-- CreateIndex
CREATE INDEX "Operation_clientId_idx" ON "Operation"("clientId");

-- CreateIndex
CREATE INDEX "Operation_status_idx" ON "Operation"("status");

-- CreateIndex
CREATE INDEX "Operation_type_idx" ON "Operation"("type");

-- CreateIndex
CREATE INDEX "Operation_priority_idx" ON "Operation"("priority");

-- CreateIndex
CREATE INDEX "Operation_createdById_idx" ON "Operation"("createdById");

-- CreateIndex
CREATE INDEX "Operation_assignedToId_idx" ON "Operation"("assignedToId");

-- CreateIndex
CREATE INDEX "OperationAssignment_tenantId_idx" ON "OperationAssignment"("tenantId");

-- CreateIndex
CREATE INDEX "OperationAssignment_operationId_idx" ON "OperationAssignment"("operationId");

-- CreateIndex
CREATE INDEX "OperationAssignment_userId_idx" ON "OperationAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationAssignment_operationId_userId_key" ON "OperationAssignment"("operationId", "userId");

-- CreateIndex
CREATE INDEX "OperationStatusHistory_tenantId_idx" ON "OperationStatusHistory"("tenantId");

-- CreateIndex
CREATE INDEX "OperationStatusHistory_operationId_idx" ON "OperationStatusHistory"("operationId");

-- CreateIndex
CREATE INDEX "OperationStatusHistory_changedById_idx" ON "OperationStatusHistory"("changedById");

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationAssignment" ADD CONSTRAINT "OperationAssignment_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationStatusHistory" ADD CONSTRAINT "OperationStatusHistory_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
