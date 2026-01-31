jest.mock("../prisma", () => ({
  __esModule: true,
  default: {
    project: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    projectCircuit: { deleteMany: jest.fn() },
    projectMarker: { deleteMany: jest.fn() },
    $queryRaw: jest.fn(),
    $executeRawUnsafe: jest.fn(),
  },
}));

import prisma from "../prisma";
import {
  getProjectById,
  getAllProjects,
  getProjectIdLabels,
  createProject,
  updateProjectById,
  deleteProjectById,
} from "./repository";
import { Project } from "@/app/_private/types/Project";

describe("Project Backend API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should succeed to return a project with circuits and markers", async () => {
    // Mocks the query to get the project.
    (prisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      label: "Project 1",
    });

    // Mocks the query to get the circuits.
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
      {
        id: 1,
        label: "Circuit 1",
        color: "#AA0000",
        geometry: JSON.stringify({
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        }),
      },
      {
        id: 2,
        label: "Circuit 2",
        color: "#BB0000",
        geometry: JSON.stringify({
          type: "LineString",
          coordinates: [
            [2, 2],
            [3, 3],
          ],
        }),
      },
    ]);

    // Mocks the query to get the circuits.
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
      {
        id: 1,
        point: JSON.stringify({
          type: "Point",
          coordinates: [0, 0],
        }),
      },
      {
        id: 2,
        point: JSON.stringify({
          type: "Point",
          coordinates: [1, 1],
        }),
      },
    ]);

    // Launches the test.
    const project = await getProjectById(1);

    // Checks.
    expect(project.id).toBe(1);
    expect(project.label).toBe("Project 1");
    expect(project.circuits.length).toBe(2);
    expect(project.circuits[0].id).toBe(1);
    expect(project.circuits[0].label).toBe("Circuit 1");
    expect(project.circuits[0].color).toBe("#AA0000");
    expect(project.circuits[0].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    });
    expect(project.circuits[1].id).toBe(2);
    expect(project.circuits[1].label).toBe("Circuit 2");
    expect(project.circuits[1].color).toBe("#BB0000");
    expect(project.circuits[1].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [2, 2],
        [3, 3],
      ],
    });
    expect(project.markers.length).toBe(2);
    expect(project.markers[0].id).toBe(1);
    expect(project.markers[0].point).toEqual({
      type: "Point",
      coordinates: [0, 0],
    });
    expect(project.markers[1].id).toBe(2);
    expect(project.markers[1].point).toEqual({
      type: "Point",
      coordinates: [1, 1],
    });
  });

  it("should succeed to return a project without circuit nor marker", async () => {
    // Mocks the query to get the project.
    (prisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      label: "Project 1",
    });

    // Mocks the query to get the circuits.
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

    // Mocks the query to get the circuits.
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

    // Launches the test.
    const project = await getProjectById(1);

    // Checks.
    expect(project.id).toBe(1);
    expect(project.label).toBe("Project 1");
    expect(project.circuits.length).toBe(0);
    expect(project.markers.length).toBe(0);
  });

  it("should succeed to return all projects", async () => {
    (prisma.project.findMany as jest.Mock).mockResolvedValue([
      { id: 1, label: "Project 1" },
      { id: 2, label: "Project 2" },
    ]);

    // Mocks the query to get the circuits.
    (prisma.$queryRaw as jest.Mock).mockImplementation(
      (query: string[], ...values: any[]) => {
        let result: any[] = [];
        const sql = query.join("");
        const projectId = values[0];

        if (sql.includes("project_circuit")) {
          if (projectId === 1) {
            result = [
              {
                id: 1,
                label: "Circuit 1",
                color: "#AA0000",
                geometry: JSON.stringify({
                  type: "LineString",
                  coordinates: [
                    [0, 0],
                    [1, 1],
                  ],
                }),
              },
              {
                id: 2,
                label: "Circuit 2",
                color: "#BB0000",
                geometry: JSON.stringify({
                  type: "LineString",
                  coordinates: [
                    [2, 2],
                    [3, 3],
                  ],
                }),
              },
            ];
          } else if (projectId === 2) {
            result = [
              {
                id: 3,
                label: "Circuit 3",
                color: "#CC0000",
                geometry: JSON.stringify({
                  type: "LineString",
                  coordinates: [
                    [4, 4],
                    [5, 5],
                  ],
                }),
              },
              {
                id: 4,
                label: "Circuit 4",
                color: "#DD0000",
                geometry: JSON.stringify({
                  type: "LineString",
                  coordinates: [
                    [6, 6],
                    [7, 7],
                  ],
                }),
              },
            ];
          }
        } else if (sql.includes("project_marker")) {
          if (projectId === 1) {
            result = [
              {
                id: 1,
                point: JSON.stringify({
                  type: "Point",
                  coordinates: [0, 0],
                }),
              },
              {
                id: 2,
                point: JSON.stringify({
                  type: "Point",
                  coordinates: [1, 1],
                }),
              },
            ];
          } else if (projectId === 2) {
            result = [
              {
                id: 3,
                point: JSON.stringify({
                  type: "Point",
                  coordinates: [2, 2],
                }),
              },
              {
                id: 4,
                point: JSON.stringify({
                  type: "Point",
                  coordinates: [3, 3],
                }),
              },
            ];
          }
        }
        return result;
      },
    );

    const projects = await getAllProjects();

    // Checks.
    expect(projects).toHaveLength(2);

    // Checks first project.
    expect(projects[0].id).toBe(1);
    expect(projects[0].label).toBe("Project 1");
    expect(projects[0].circuits.length).toBe(2);
    expect(projects[0].circuits[0].id).toBe(1);
    expect(projects[0].circuits[0].label).toBe("Circuit 1");
    expect(projects[0].circuits[0].color).toBe("#AA0000");
    expect(projects[0].circuits[0].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    });
    expect(projects[0].circuits[1].id).toBe(2);
    expect(projects[0].circuits[1].label).toBe("Circuit 2");
    expect(projects[0].circuits[1].color).toBe("#BB0000");
    expect(projects[0].circuits[1].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [2, 2],
        [3, 3],
      ],
    });
    expect(projects[0].markers.length).toBe(2);
    expect(projects[0].markers[0].id).toBe(1);
    expect(projects[0].markers[0].point).toEqual({
      type: "Point",
      coordinates: [0, 0],
    });
    expect(projects[0].markers[1].id).toBe(2);
    expect(projects[0].markers[1].point).toEqual({
      type: "Point",
      coordinates: [1, 1],
    });

    // Checks second project.
    expect(projects[1].id).toBe(2);
    expect(projects[1].label).toBe("Project 2");
    expect(projects[1].circuits.length).toBe(2);
    expect(projects[1].circuits[0].id).toBe(3);
    expect(projects[1].circuits[0].label).toBe("Circuit 3");
    expect(projects[1].circuits[0].color).toBe("#CC0000");
    expect(projects[1].circuits[0].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [4, 4],
        [5, 5],
      ],
    });
    expect(projects[1].circuits[1].id).toBe(4);
    expect(projects[1].circuits[1].label).toBe("Circuit 4");
    expect(projects[1].circuits[1].color).toBe("#DD0000");
    expect(projects[1].circuits[1].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [6, 6],
        [7, 7],
      ],
    });
    expect(projects[1].markers.length).toBe(2);
    expect(projects[1].markers[0].id).toBe(3);
    expect(projects[1].markers[0].point).toEqual({
      type: "Point",
      coordinates: [2, 2],
    });
    expect(projects[1].markers[1].id).toBe(4);
    expect(projects[1].markers[1].point).toEqual({
      type: "Point",
      coordinates: [3, 3],
    });
  });

  it("should succeed to return all project Id-Label pairs", async () => {
    (prisma.project.findMany as jest.Mock).mockResolvedValue([
      { id: 1, label: "Project 1" },
      { id: 2, label: "Project 2" },
    ]);

    const projectIdLabels = await getProjectIdLabels();

    // Checks.
    expect(projectIdLabels).toHaveLength(2);

    // Checks first project.
    expect(projectIdLabels[0].id).toBe(1);
    expect(projectIdLabels[0].label).toBe("Project 1");

    // Checks second project.
    expect(projectIdLabels[1].id).toBe(2);
    expect(projectIdLabels[1].label).toBe("Project 2");
  });

  it("should succeed to create a project with circuits and markers", async () => {
    //////////////////////////////////////
    // Mocks the project to create (input).
    //////////////////////////////////////
    const mockProjectInput: Project = {
      label: "Project 1",
      circuits: [
        {
          id: 1,
          label: "Circuit 1",
          color: "#AA0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        },
        {
          id: 2,
          label: "Circuit 2",
          color: "#BB0000",
          geometry: {
            type: "LineString",
            coordinates: [
              [2, 2],
              [3, 3],
            ],
          },
        },
      ],
      markers: [
        {
          id: 1,
          point: {
            type: "Point",
            coordinates: [0, 0],
          },
        },
        {
          id: 2,
          point: {
            type: "Point",
            coordinates: [1, 1],
          },
        },
      ],
    };

    //////////////////////////////////////
    // Mocks the created project (re-read from database).
    //////////////////////////////////////
    // Mocks the query to get the project.
    const mockCreatedProject = { id: 1, label: "Project 1" };
    const mockCreatedProjectCircs = [
      {
        id: 1,
        label: "Circuit 1",
        color: "#AA0000",
        geometry: JSON.stringify({
          type: "LineString",
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        }),
      },
      {
        id: 2,
        label: "Circuit 2",
        color: "#BB0000",
        geometry: JSON.stringify({
          type: "LineString",
          coordinates: [
            [2, 2],
            [3, 3],
          ],
        }),
      },
    ];
    const mockCreatedProjectMarkers = [
      {
        id: 1,
        point: JSON.stringify({
          type: "Point",
          coordinates: [0, 0],
        }),
      },
      {
        id: 2,
        point: JSON.stringify({
          type: "Point",
          coordinates: [1, 1],
        }),
      },
    ];

    (prisma.project.create as jest.Mock).mockResolvedValue(mockCreatedProject);
    (prisma.project.findUnique as jest.Mock).mockResolvedValue(
      mockCreatedProject,
    );

    (prisma.$queryRaw as jest.Mock).mockImplementation((query: string[]) => {
      const sql = query.join("");

      if (sql.includes("project_circuit")) {
        return mockCreatedProjectCircs;
      } else if (sql.includes("project_marker")) {
        return mockCreatedProjectMarkers;
      }
      return null;
    });

    //////////////////////////////////////
    // Test.
    //////////////////////////////////////
    // Launches the test.
    const project = await createProject(mockProjectInput);

    // Checks.
    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        label: "Project 1",
      },
    });
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(
        'INSERT INTO \"project_circuit\" (project_id, label, color, geometry)',
      ),
      1,
      "Circuit 1",
      "#AA0000",
      JSON.stringify(mockProjectInput.circuits![0].geometry),
    );
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(
        'INSERT INTO \"project_circuit\" (project_id, label, color, geometry)',
      ),
      1,
      "Circuit 2",
      "#BB0000",
      JSON.stringify(mockProjectInput.circuits![1].geometry),
    );
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(
        'INSERT INTO \"project_marker\" (project_id, point)',
      ),
      1,
      JSON.stringify(mockProjectInput.markers![0].point),
    );
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(
        'INSERT INTO \"project_marker\" (project_id, point)',
      ),
      1,
      JSON.stringify(mockProjectInput.markers![1].point),
    );
    expect(project.id).toBe(1);
    expect(project.label).toBe("Project 1");
    expect(project.circuits.length).toBe(2);
    expect(project.circuits[0].id).toBe(1);
    expect(project.circuits[0].label).toBe("Circuit 1");
    expect(project.circuits[0].color).toBe("#AA0000");
    expect(project.circuits[0].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    });
    expect(project.circuits[1].id).toBe(2);
    expect(project.circuits[1].label).toBe("Circuit 2");
    expect(project.circuits[1].color).toBe("#BB0000");
    expect(project.circuits[1].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [2, 2],
        [3, 3],
      ],
    });
    expect(project.markers.length).toBe(2);
    expect(project.markers[0].id).toBe(1);
    expect(project.markers[0].point).toEqual({
      type: "Point",
      coordinates: [0, 0],
    });
    expect(project.markers[1].id).toBe(2);
    expect(project.markers[1].point).toEqual({
      type: "Point",
      coordinates: [1, 1],
    });
  });

  it("should succeed to update a project with circuits and markers", async () => {
    //////////////////////////////////////
    // Mocks the project to update (input).
    //////////////////////////////////////
    const mockProjectInput: Project = {
      id: 1,
      label: "Project 1 UPDATED",
      circuits: [
        {
          id: 1,
          label: "Circuit 1 UPDATED",
          color: "#00AA00",
          geometry: {
            type: "LineString",
            coordinates: [
              [1, 1],
              [2, 2],
            ],
          },
        },
        {
          id: 2,
          label: "Circuit 2 UPDATED",
          color: "#00BB00",
          geometry: {
            type: "LineString",
            coordinates: [
              [3, 3],
              [4, 4],
            ],
          },
        },
      ],
      markers: [
        {
          id: 1,
          point: {
            type: "Point",
            coordinates: [1, 1],
          },
        },
        {
          id: 2,
          point: {
            type: "Point",
            coordinates: [2, 2],
          },
        },
      ],
    };

    //////////////////////////////////////
    // Mocks the updated project (re-read from database).
    //////////////////////////////////////
    // Mocks the query to get the project.
    const mockUpdatedProject = { id: 1, label: "Project 1 UPDATED" };
    const mockUpdatedProjectCircs = [
      {
        id: 1,
        label: "Circuit 1 UPDATED",
        color: "#00AA00",
        geometry: JSON.stringify({
          type: "LineString",
          coordinates: [
            [1, 1],
            [2, 2],
          ],
        }),
      },
      {
        id: 2,
        label: "Circuit 2 UPDATED",
        color: "#00BB00",
        geometry: JSON.stringify({
          type: "LineString",
          coordinates: [
            [3, 3],
            [4, 4],
          ],
        }),
      },
    ];
    const mockUpdatedProjectMarkers = [
      {
        id: 1,
        point: JSON.stringify({
          type: "Point",
          coordinates: [1, 1],
        }),
      },
      {
        id: 2,
        point: JSON.stringify({
          type: "Point",
          coordinates: [2, 2],
        }),
      },
    ];

    (prisma.project.update as jest.Mock).mockResolvedValue(mockUpdatedProject);
    (prisma.project.findUnique as jest.Mock).mockResolvedValue(
      mockUpdatedProject,
    );

    (prisma.$queryRaw as jest.Mock).mockImplementation((query: string[]) => {
      const sql = query.join("");

      if (sql.includes("project_circuit")) {
        return mockUpdatedProjectCircs;
      } else if (sql.includes("project_marker")) {
        return mockUpdatedProjectMarkers;
      }
      return null;
    });

    //////////////////////////////////////
    // Test.
    //////////////////////////////////////
    // Launches the test.
    const project = await updateProjectById(1, mockProjectInput);

    // Checks.
    expect(prisma.project.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        id: 1,
        label: "Project 1 UPDATED",
      },
    });
    expect(prisma.projectCircuit.deleteMany).toHaveBeenCalledWith({
      where: { projectId: 1 },
    });
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(
        'INSERT INTO \"project_circuit\" (project_id, label, color, geometry)',
      ),
      1,
      "Circuit 1 UPDATED",
      "#00AA00",
      JSON.stringify(mockProjectInput.circuits![0].geometry),
    );
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(
        'INSERT INTO \"project_circuit\" (project_id, label, color, geometry)',
      ),
      1,
      "Circuit 2 UPDATED",
      "#00BB00",
      JSON.stringify(mockProjectInput.circuits![1].geometry),
    );
    expect(prisma.projectMarker.deleteMany).toHaveBeenCalledWith({
      where: { projectId: 1 },
    });
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(
        'INSERT INTO \"project_marker\" (project_id, point)',
      ),
      1,
      JSON.stringify(mockProjectInput.markers![0].point),
    );
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(
        'INSERT INTO \"project_marker\" (project_id, point)',
      ),
      1,
      JSON.stringify(mockProjectInput.markers![1].point),
    );
    expect(project.id).toBe(1);
    expect(project.label).toBe("Project 1 UPDATED");
    expect(project.circuits.length).toBe(2);
    expect(project.circuits[0].id).toBe(1);
    expect(project.circuits[0].label).toBe("Circuit 1 UPDATED");
    expect(project.circuits[0].color).toBe("#00AA00");
    expect(project.circuits[0].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [1, 1],
        [2, 2],
      ],
    });
    expect(project.circuits[1].id).toBe(2);
    expect(project.circuits[1].label).toBe("Circuit 2 UPDATED");
    expect(project.circuits[1].color).toBe("#00BB00");
    expect(project.circuits[1].geometry).toEqual({
      type: "LineString",
      coordinates: [
        [3, 3],
        [4, 4],
      ],
    });
    expect(project.markers.length).toBe(2);
    expect(project.markers[0].id).toBe(1);
    expect(project.markers[0].point).toEqual({
      type: "Point",
      coordinates: [1, 1],
    });
    expect(project.markers[1].id).toBe(2);
    expect(project.markers[1].point).toEqual({
      type: "Point",
      coordinates: [2, 2],
    });
  });

  it("should succeed to delete a project", async () => {
    const projectId = 1;

    // Mocks the deletion of the circuits.
    (prisma.projectCircuit.deleteMany as jest.Mock).mockResolvedValue({
      count: 2,
    });

    // Mocks the deletion of the markers.
    (prisma.projectMarker.deleteMany as jest.Mock).mockResolvedValue({
      count: 5,
    });

    // Mocks the deletion of the project.
    (prisma.project.delete as jest.Mock).mockResolvedValue({ id: projectId });

    // Launches the test.
    const result = await deleteProjectById(projectId);

    // Checks.
    expect(prisma.projectCircuit.deleteMany).toHaveBeenCalledWith({
      where: { projectId: projectId },
    });
    expect(prisma.projectMarker.deleteMany).toHaveBeenCalledWith({
      where: { projectId: projectId },
    });
    expect(prisma.project.delete).toHaveBeenCalledWith({
      where: { id: projectId },
    });

    // Return of the function.
    expect(result).toBe(projectId);
  });
});
