/*
  Warnings:

  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
