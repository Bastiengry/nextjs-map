import { render, screen, within } from "@testing-library/react";
import ProjectToolbar from "./ProjectToolbar";
import userEvent from "@testing-library/user-event";
import { Project } from "../../types/Project";

describe("ProjectToolbar component", () => {
  test("should display well without selected project", async () => {
    render(
      <ProjectToolbar
        project={undefined}
        onCreateProject={() => {}}
        onOpenProject={() => {}}
        onEditProject={() => {}}
        onDeleteProject={() => {}}
      />,
    );

    const projectToolbar = await screen.findByLabelText("project-toolbar");

    // Checks the presence of the button to create a project.
    within(projectToolbar).getByLabelText("create-project-button");

    // Checks the presence of the button to open a project.
    within(projectToolbar).getByLabelText("open-project-button");

    // Checks that the title bar displays that no project is selected.
    const titleComp = within(projectToolbar).getByLabelText(
      "current-project-text",
    );
    expect(titleComp).toHaveValue(
      "projectToolbar.projectNameInput.noProjectSelect",
    );

    // Checks the presence of the button to edit a project.
    within(projectToolbar).getByLabelText("edit-project-button");
  });

  test("should display well with selected project", async () => {
    const mockProject: Project = {
      id: 1,
      label: "PRJ1",
    };

    render(
      <ProjectToolbar
        project={mockProject}
        onCreateProject={() => {}}
        onOpenProject={() => {}}
        onEditProject={() => {}}
        onDeleteProject={() => {}}
      />,
    );

    const projectToolbar = await screen.findByLabelText("project-toolbar");

    // Checks the presence of the button to create a project.
    within(projectToolbar).getByLabelText("create-project-button");

    // Checks the presence of the button to open a project.
    within(projectToolbar).getByLabelText("open-project-button");

    // Checks the presence of the name of the project in the title.
    const titleComp = within(projectToolbar).getByLabelText(
      "current-project-text",
    );
    expect(titleComp).toHaveValue("PRJ1");

    // Checks the presence of the button to edit a project.
    within(projectToolbar).getByLabelText("edit-project-button");
  });

  test("should call the good callback when clicking on the button to create a project", async () => {
    const mockOnCreateProject = jest.fn();

    render(
      <ProjectToolbar
        project={undefined}
        onCreateProject={mockOnCreateProject}
        onOpenProject={() => {}}
        onEditProject={() => {}}
        onDeleteProject={() => {}}
      />,
    );

    const projectToolbar = await screen.findByLabelText("project-toolbar");

    // Checks the presence of the button to create a project.
    const createProjectBtn = within(projectToolbar).getByLabelText(
      "create-project-button",
    );

    // Clicks on the button to create a project.
    await userEvent.click(createProjectBtn);

    // Checks that the good callback is called.
    expect(mockOnCreateProject).toHaveBeenCalled();
  });

  test("should call the good callback when clicking on the button to open a project", async () => {
    const mockOnOpenProject = jest.fn();

    render(
      <ProjectToolbar
        project={undefined}
        onCreateProject={() => {}}
        onOpenProject={mockOnOpenProject}
        onEditProject={() => {}}
        onDeleteProject={() => {}}
      />,
    );

    const projectToolbar = await screen.findByLabelText("project-toolbar");

    // Checks the presence of the button to open a project.
    const openProjectBtn = within(projectToolbar).getByLabelText(
      "open-project-button",
    );

    // Clicks on the button to open a project.
    await userEvent.click(openProjectBtn);

    // Checks that the good callback is called.
    expect(mockOnOpenProject).toHaveBeenCalled();
  });

  test("should call the good callback when clicking on the button to edit the current project", async () => {
    const mockProject: Project = {
      id: 1,
      label: "PRJ1",
    };

    const mockOnEditProject = jest.fn();

    render(
      <ProjectToolbar
        project={mockProject}
        onCreateProject={() => {}}
        onOpenProject={() => {}}
        onEditProject={mockOnEditProject}
        onDeleteProject={() => {}}
      />,
    );

    const projectToolbar = await screen.findByLabelText("project-toolbar");

    // Checks the presence of the button to edit a project.
    const editProjectBtn = within(projectToolbar).getByLabelText(
      "edit-project-button",
    );
    const mainBtnInEditProjectBtn = within(editProjectBtn).getByLabelText(
      "projectToolbar.editBtn.label",
    );

    // Clicks on the button to edit a project.
    await userEvent.click(mainBtnInEditProjectBtn);

    // Checks that the good callback is called.
    expect(mockOnEditProject).toHaveBeenCalledWith(mockProject.id);
  });

  test("should call the good callback when clicking on the button to delete the current project", async () => {
    const mockProject: Project = {
      id: 1,
      label: "PRJ1",
    };

    const mockOnDeleteProject = jest.fn();

    render(
      <ProjectToolbar
        project={mockProject}
        onCreateProject={() => {}}
        onOpenProject={() => {}}
        onEditProject={() => {}}
        onDeleteProject={mockOnDeleteProject}
      />,
    );

    const projectToolbar = await screen.findByLabelText("project-toolbar");

    // Checks the presence of the button to edit a project.
    const editProjectBtn = within(projectToolbar).getByLabelText(
      "edit-project-button",
    );

    // Opens the menu to find the delete option on split button.
    const expandMenuInEditProjectBtn =
      within(editProjectBtn).getByLabelText("expand-edit-menu");
    await userEvent.click(expandMenuInEditProjectBtn!);

    // Gets the delete option.
    const deleteOption = await screen.findByText(
      "projectToolbar.deleteBtn.label",
    );

    // Clicks on the delete option.
    await userEvent.click(deleteOption);

    // Checks that the good callback is called.
    expect(mockOnDeleteProject).toHaveBeenCalledWith(mockProject.id);
  });
});
