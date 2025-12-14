import prisma from "../prisma";

export const getAllProjects = async () => {
  const projects: any[] = [];

  const prismaProjects: any[] = await prisma.project.findMany();

  for (const prismaProject of prismaProjects) {
    const projectCircuits: any[] = await getProjectCircuits(prismaProject.id);
    const project = convertPrismaProjectToProject(
      prismaProject,
      projectCircuits
    );
    projects.push(project);
  }
  return projects;
};

export const getProjectCircuits = async (projectId: number) => {
  return await prisma.$queryRaw<
    { id: number; label: string; geometry: string }[]
  >`SELECT id, label, ST_AsGeoJSON(geometry) as geometry FROM project_circuit WHERE project_id=${projectId};`;
};

export const getProjectById = async (id: number) => {
  const prismaProject: any = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  let prismaProjectCircuits: any[] = [];
  if (prismaProject) {
    prismaProjectCircuits.push(...(await getProjectCircuits(id)));
  }
  return convertPrismaProjectToProject(prismaProject, prismaProjectCircuits);
};

export const getProjectIdLabels = async () => {
  const prismaProjects: any[] = await prisma.project.findMany({
    include: { circuits: false },
  });

  return prismaProjects.map((prismaPrj) => ({
    id: prismaPrj.id,
    label: prismaPrj.label,
  }));
};

export const createProject = async (project: any) => {
  const createdProject = await prisma.project.create({
    data: {
      id: project.id,
      label: project.label,
    },
  });

  if (project.circuits) {
    for (const circuit of project.circuits) {
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "project_circuit" (project_id, label, geometry)
        VALUES (
          $1,
          $2,
          ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)
        )
        `,
        createdProject.id,
        circuit.label,
        JSON.stringify(circuit.geometry)
      );
    }
  }

  return getProjectById(createdProject.id);
};

export const updateProjectById = async (id: number, project: any) => {
  await prisma.project.update({
    where: {
      id,
    },
    data: {
      id: project.id,
      label: project.label,
    },
  });

  await prisma.projectCircuit.deleteMany({ where: { projectId: project.id } });

  if (project.circuits) {
    for (const circuit of project.circuits) {
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "project_circuit" (project_id, label, geometry)
        VALUES (
          $1,
          $2,
          ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)
        )
        `,
        project.id,
        circuit.label,
        JSON.stringify(circuit.geometry)
      );
    }
  }

  return getProjectById(id);
};

export const deleteProjectById = async (id: number) => {
  await prisma.projectCircuit.deleteMany({ where: { projectId: Number(id) } });

  await prisma.project.delete({
    where: {
      id,
    },
  });

  return id;
};

export default function convertPrismaProjectToProject(
  prismaProject: any,
  prismaProjectCircuits: any[]
) {
  return {
    id: prismaProject.id,
    label: prismaProject.label,
    circuits: prismaProjectCircuits.map((prismaPrjCirc: any) => ({
      id: prismaPrjCirc.id,
      label: prismaPrjCirc.label,
      geometry: prismaPrjCirc.geometry
        ? JSON.parse(prismaPrjCirc.geometry)
        : null,
    })),
  };
}
