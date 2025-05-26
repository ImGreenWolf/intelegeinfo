-- CreateTable
CREATE TABLE "Code" (
    "code" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "iat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "code" TEXT NOT NULL,
    "hmac" TEXT NOT NULL,
    "iat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Code_code_key" ON "Code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_code_key" ON "RefreshToken"("code");
