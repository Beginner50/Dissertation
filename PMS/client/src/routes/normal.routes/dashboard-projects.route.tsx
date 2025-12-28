import { ProjectList } from "../../components/project.components/project-list.component";
import { ReminderList } from "../../components/reminder-list.components/reminder-list.component";
import type { Project, ProjectFormData } from "../../lib/types";
import { origin, user } from "../../lib/temp";
import { useCallback, useState } from "react";
import ProjectModal, {
  type ModalState as ProjectModalState,
} from "../../components/project.components/project-modal.component";
import { useProjectsMutation } from "../../lib/hooks/useProjectsMutation";
import {
  useProjectsQuery,
  useUnsupervisedProjectsQuery,
} from "../../lib/hooks/useProjectsQuery";
import { Selector } from "../../components/base.components/selector.component";

export default function DashboardProjectsRoute() {
  const [projectModalState, setProjectModalState] = useState<ProjectModalState>(
    { mode: "create", open: false }
  );
  const [projectModalData, setProjectModalData] = useState<ProjectFormData>({
    projectID: 0,
    title: "",
    description: "",
  });
  const [projectSearchTerm, setProjectSearchTerm] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project>();

  const projectMutation = useProjectsMutation();
  const { data: projects, isLoading: projectsLoading } = useProjectsQuery();
  const { data: unsupervisedProjects, isLoading: unsupervisedProjectsLoading } =
    useUnsupervisedProjectsQuery({ disabled: user.role !== "supervisor" });

  /* ---------------------------------------------------------------------------------- */

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCreateProjectClick = () => {
    setProjectModalState((ms) => ({ ...ms, mode: "create", open: true }));
  };

  const handleJoinProjectClick = () => {
    setProjectModalState((ms) => ({ ...ms, mode: "join-project", open: true }));
  };

  const handleEditProjectClick = (projectData: ProjectFormData) => {
    setProjectModalData(projectData);
    setProjectModalState((ms) => ({ ...ms, mode: "edit", open: true }));
  };

  const handleArchiveProjectClick = (projectData: ProjectFormData) => {
    setProjectModalData(projectData);
    setProjectModalState((ms) => ({ ...ms, mode: "archive", open: true }));
  };

  const handleCancelClick = () => {
    setProjectModalState((ms) => ({ ...ms, open: false }));
    setProjectModalData({ projectID: 0, title: "", description: "" });
  };

  /* ---------------------------------------------------------------------------------- */

  const handleTitleChange = useCallback((title: string) => {
    setProjectModalData((p) => ({ ...p, title: title }));
  }, []);
  const handleDescriptionChange = useCallback((description: string) => {
    setProjectModalData((p) => ({
      ...p,
      description: description,
    }));
  }, []);
  const handleSearchChange = useCallback((searchTerm: string) => {
    setProjectSearchTerm(searchTerm);
  }, []);

  /* ---------------------------------------------------------------------------------- */

  const handleCreateProject = () => {
    projectMutation.mutate({
      method: "post",
      url: `${origin}/api/users/${user.userID}/projects`,
      data: projectModalData,
    });
    setProjectModalState((p) => ({ ...p, open: false }));
  };

  const handleEditProject = () => {
    projectMutation.mutate({
      method: "put",
      url: `${origin}/api/users/${user.userID}/projects/${projectModalData.projectID}`,
      data: projectModalData,
    });
    setProjectModalState((p) => ({ ...p, open: false }));
  };

  const handleArchiveProject = () => {
    projectMutation.mutate({
      method: "delete",
      url: `${origin}/api/users/${user.userID}/projects/${projectModalData.projectID}`,
      data: {},
    });
    setProjectModalState((p) => ({ ...p, open: false }));
  };

  const handleJoinProject = () => {
    projectMutation.mutate({
      method: "put",
      url: `${origin}/api/users/${user.userID}/projects/${selectedProject?.projectID}/join`,
      data: {},
    });
    setSelectedProject(undefined);
    setProjectModalState((p) => ({ ...p, open: false }));
  };

  /* ---------------------------------------------------------------------------------- */

  const filteredProjects = unsupervisedProjects?.filter(
    (p) =>
      p.title.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
      p.student?.name.toLowerCase().includes(projectSearchTerm.toLowerCase())
  );

  const isFormInvalid = Object.entries(projectModalData).some(([key, val]) => {
    if (typeof val == "number") return Number.isNaN(val);
    return val == "";
  });

  return (
    <>
      {/* Project List */}
      <ProjectList
        sx={{
          flexGrow: 3,
          overflowY: "auto",
          flexDirection: "column",
        }}
      >
        <ProjectList.Header>
          {user.role === "supervisor" && (
            <>
              <ProjectList.CreateProjectButton
                onClick={handleCreateProjectClick}
              />
              <ProjectList.JoinProjectButton onClick={handleJoinProjectClick} />
            </>
          )}
        </ProjectList.Header>

        {!projectsLoading && (
          <ProjectList.List
            projects={projects ?? []}
            handleEditProjectClick={handleEditProjectClick}
            handleArchiveProjectClick={handleArchiveProjectClick}
          />
        )}
      </ProjectList>

      {/* Reminder List */}
      <ReminderList
        sx={{
          flexGrow: 1,
        }}
      />

      {/* Project Modal */}
      <ProjectModal open={projectModalState.open}>
        <ProjectModal.Header mode={projectModalState.mode} />

        {(projectModalState.mode === "create" ||
          projectModalState.mode === "edit") && (
          <ProjectModal.Fields>
            <ProjectModal.ProjectID
              projectID={projectModalData?.projectID ?? 0}
              visible={projectModalState.mode == "edit"}
            />
            <ProjectModal.ProjectTitle
              title={projectModalData?.title ?? ""}
              handleTitleChange={handleTitleChange}
            />
            <ProjectModal.ProjectDescription
              description={projectModalData?.description ?? ""}
              handleDescriptionChange={handleDescriptionChange}
            />
          </ProjectModal.Fields>
        )}

        {projectModalState.mode === "join-project" && (
          <Selector>
            <Selector.Search
              placeholder="Search projects by title or student..."
              searchTerm={projectSearchTerm}
              handleSearchChange={handleSearchChange}
            />
            <Selector.List>
              {filteredProjects && filteredProjects.length > 0 ? (
                filteredProjects.map((p) => (
                  <Selector.ProjectListEntry
                    project={p}
                    isSelected={p.projectID == selectedProject?.projectID}
                    handleSelectProject={() => handleSelectProject(p)}
                  />
                ))
              ) : (
                <Selector.NotFound placeholder="No projects match your search" />
              )}
            </Selector.List>
          </Selector>
        )}

        {projectModalState.mode == "archive" && <ProjectModal.ArchiveWarning />}

        <ProjectModal.Actions
          mode={projectModalState.mode}
          disabled={
            (isFormInvalid &&
              (projectModalState.mode == "create" ||
                projectModalState.mode == "edit")) ||
            (selectedProject == undefined &&
              projectModalState.mode == "join-project")
          }
          handleCancelClick={handleCancelClick}
          handleCreateProject={handleCreateProject}
          handleEditProject={handleEditProject}
          handleArchiveProject={handleArchiveProject}
          handleJoinProject={handleJoinProject}
        />
      </ProjectModal>
    </>
  );
}
