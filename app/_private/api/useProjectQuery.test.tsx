import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useDeleteProject,
  useGetProject,
  usePostProject,
  useProjectIdLabelQuery,
  usePutProject,
} from "./useProjectQuery";

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProjectQuery Hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        // Avoid delays because of retries in tests
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // --- Tests of useGetProject ---

  test("useGetProject must succeed to read a project", async () => {
    const mockProject = { id: 1, name: "Test Project" };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockProject,
    });

    const { result } = renderHook(() => useGetProject(queryClient, 1), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProject);
    expect(global.fetch).toHaveBeenCalledWith("/api/projects/1");
  });

  test("useGetProject must manage failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useGetProject(queryClient, 1), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  // --- Tests of usePostProject ---

  test("usePostProject must succeed to create a project", async () => {
    const newProject = { id: 10, name: "New" };
    const onPostSuccess = jest.fn();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => newProject,
    });

    // Spies invalidateQueries
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    // Renders the hook.
    const { result } = renderHook(
      () => usePostProject(queryClient, onPostSuccess),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    // Launches the test.
    result.current.mutate(newProject as any);

    // Checks.
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onPostSuccess).toHaveBeenCalledWith(newProject);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["projectIdLabels"],
    });
    expect(queryClient.getQueryData(["project", 10])).toEqual(newProject);
  });

  test("usePostProject must manage failure", async () => {
    const newProject = { id: 10, name: "New" };
    const onPostSuccess = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    // Renders the hook.
    const { result } = renderHook(
      () => usePostProject(queryClient, onPostSuccess),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    // Launches the test.
    result.current.mutate(newProject as any);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  // --- Tests of usePutProject  ---
  test("usePutProject must succeed to update the project", async () => {
    const oldProject = { id: 1, name: "Old Name" };
    const updatedProject = { id: 1, name: "New Name" };

    // Initializes the cache with the old value
    queryClient.setQueryData(["project", 1], oldProject);

    // Simulates the request
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => updatedProject,
    });

    // Spies the invalidation.
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    // Renders the hook.
    const { result } = renderHook(() => usePutProject(queryClient), {
      wrapper: createWrapper(queryClient),
    });

    // Launches the test.
    result.current.mutate(updatedProject as any);

    // Checks.
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["projectIdLabels"],
      }),
    );
    expect(queryClient.getQueryData(["project", 1])).toEqual(updatedProject);
  });

  // --- Tests of usePutProject in error ---
  test("usePutProject must manage failure (reset old project data if error after optimistic update)", async () => {
    const oldProject = { id: 1, name: "Old Name" };
    const updatedProject = { id: 1, name: "New Name" };

    // Initializes the cache with the old value
    queryClient.setQueryData(["project", 1], oldProject);

    // Simulates an error to check the rollback
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ ok: false }), 200)),
    );

    // Renders the hook.
    const { result } = renderHook(() => usePutProject(queryClient), {
      wrapper: createWrapper(queryClient),
    });

    // Launches the test.
    result.current.mutate(updatedProject as any);

    // Checks the optimistic update (immediate)
    await waitFor(() =>
      expect(queryClient.getQueryData(["project", 1])).toEqual(updatedProject),
    );

    // Check the rollback
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(["project", 1])).toEqual(oldProject);
  });

  // --- Tests of useDeleteProject ---
  test("useDeleteProject must succeed to delete the project", async () => {
    const projectId = 5;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: projectId }),
    });

    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    // Renders the hook.
    const { result } = renderHook(() => useDeleteProject(queryClient), {
      wrapper: createWrapper(queryClient),
    });

    // Launches the test.
    result.current.mutate(projectId);

    // Checks.
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Checks the invalidation of the cache.
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["project", projectId],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["projectIdLabels"],
    });
  });

  test("useDeleteProject must manage failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    // Renders the hook.
    const { result } = renderHook(() => useDeleteProject(queryClient), {
      wrapper: createWrapper(queryClient),
    });

    // Launches the test.
    result.current.mutate(1);

    // Checks.
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test("useProjectIdLabelQuery must succeed to read projects (light data)", async () => {
    const mockProjects = [
      { id: 1, label: "Project 1" },
      { id: 2, label: "Project 2" },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockProjects,
    });

    // Renders the hook.
    const { result } = renderHook(() => useProjectIdLabelQuery(), {
      wrapper: createWrapper(queryClient),
    });

    // Checks.
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProjects);
    expect(global.fetch).toHaveBeenCalledWith("/api/projects/idLabels");
  });

  test("useProjectIdLabelQuery must manage failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    // Renders the hook.
    const { result } = renderHook(() => useProjectIdLabelQuery(), {
      wrapper: createWrapper(queryClient),
    });

    // Checks.
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
