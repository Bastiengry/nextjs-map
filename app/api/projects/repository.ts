import prisma from "../prisma";

export const getAllProjects = async () => {
  const projects: any[] = [];

  const prismaProjects: any[] = await prisma.project.findMany();

  for (const prismaProject of prismaProjects) {
    const projectCircuits: any[] = await getProjectCircuits(prismaProject.id);
    const projectMarkers: any[] = await getProjectMarkers(prismaProject.id);
    const project = convertPrismaProjectToProject(
      prismaProject,
      projectCircuits,
      projectMarkers,
    );
    projects.push(project);
  }
  return projects;
};

export const getProjectCircuits = async (projectId: number) => {
  return await prisma.$queryRaw<
    { id: number; label: string; geometry: string }[]
  >`SELECT id, label, color, ST_AsGeoJSON(geometry) as geometry FROM project_circuit WHERE project_id=${projectId};`;
};

export const getProjectMarkers = async (projectId: number) => {
  return await prisma.$queryRaw<
    { id: number; point: string }[]
  >`SELECT id, ST_AsGeoJSON(point) as point FROM project_marker WHERE project_id=${projectId};`;
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

  let prismaProjectMarkers: any[] = [];
  if (prismaProject) {
    prismaProjectMarkers.push(...(await getProjectMarkers(id)));
  }
  return convertPrismaProjectToProject(
    prismaProject,
    prismaProjectCircuits,
    prismaProjectMarkers,
  );
};

export const getProjectIdLabels = async () => {
  const prismaProjects: any[] = await prisma.project.findMany({
    include: { circuits: false },
  });

  return prismaProjects
    .map((prismaPrj) => ({
      id: prismaPrj.id,
      label: prismaPrj.label,
    }))
    .sort();
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
        INSERT INTO "project_circuit" (project_id, label, color, geometry)
        VALUES (
          $1,
          $2,
          $3,
          ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)
        )
        `,
        createdProject.id,
        circuit.label,
        circuit.color,
        JSON.stringify(circuit.geometry),
      );
    }
  }

  if (project.markers) {
    for (const marker of project.markers) {
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "project_marker" (project_id, point)
        VALUES (
          $1,
          ST_SetSRID(ST_GeomFromGeoJSON($2), 4326)
        )
        `,
        createdProject.id,
        JSON.stringify(marker.point),
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
  await prisma.projectMarker.deleteMany({ where: { projectId: project.id } });

  if (project.circuits) {
    for (const circuit of project.circuits) {
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "project_circuit" (project_id, label, color, geometry)
        VALUES (
          $1,
          $2,
          $3,
          ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)
        )
        `,
        project.id,
        circuit.label,
        circuit.color,
        JSON.stringify(circuit.geometry),
      );
    }
  }

  if (project.markers) {
    for (const marker of project.markers) {
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "project_marker" (project_id, point)
        VALUES (
          $1,
          ST_SetSRID(ST_GeomFromGeoJSON($2), 4326)
        )
        `,
        project.id,
        JSON.stringify(marker.point),
      );
    }
  }

  return getProjectById(id);
};

export const deleteProjectById = async (id: number) => {
  await prisma.projectCircuit.deleteMany({ where: { projectId: Number(id) } });
  await prisma.projectMarker.deleteMany({ where: { projectId: Number(id) } });

  await prisma.project.delete({
    where: {
      id,
    },
  });

  return id;
};

export default function convertPrismaProjectToProject(
  prismaProject: any,
  prismaProjectCircuits: any[],
  prismaProjectMarkers: any[],
) {
  return {
    id: prismaProject.id,
    label: prismaProject.label,
    circuits: prismaProjectCircuits.map((prismaPrjCirc: any) => ({
      id: prismaPrjCirc.id,
      label: prismaPrjCirc.label,
      color: prismaPrjCirc.color,
      geometry: prismaPrjCirc.geometry
        ? JSON.parse(prismaPrjCirc.geometry)
        : null,
    })),
    markers: prismaProjectMarkers.map((prismaPrjMarker: any) => ({
      id: prismaPrjMarker.id,
      point: prismaPrjMarker.point ? JSON.parse(prismaPrjMarker.point) : null,
    })),
  };
}
