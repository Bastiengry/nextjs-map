-- CreateTable
CREATE TABLE "project" (
    "id" SERIAL NOT NULL,
    "label" VARCHAR(256) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_circuit" (
    "id" SERIAL NOT NULL,
    "label" VARCHAR(256) NOT NULL,
    "geometry" geometry NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "project_circuit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_circuit" ADD CONSTRAINT "project_circuit_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
