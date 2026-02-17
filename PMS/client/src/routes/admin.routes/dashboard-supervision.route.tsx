import { Paper } from "@mui/material";
import { ProjectList } from "../../components/project.components/project-list.component";
import ProjectSupervisionTable from "../../components/project.components/project-supervision-table.component";
import { theme } from "../../lib/theme";
import type { Project, ProjectSupervisionFormData, User } from "../../lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useAuth } from "../../providers/auth.provider";
import ProjectModal, {
  type ModalState as ProjectModalState,
} from "../../components/project.components/project-modal.component";
import TableLayout from "../../components/base.components/table-layout.component";

export default function DashboardSupervisionRoute() {
  const { authorizedAPI } = useAuth();
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);

  const [projectSupervisionModalState, setProjectSupervisionModalState] =
    useState<ProjectModalState>({
      mode: "create",
      open: false,
    });

  const [projectSupervisionModalData, setProjectSupervisionModalData] =
    useState<ProjectSupervisionFormData>({
      projectID: 0,
      title: "",
      description: "",
      student: undefined,
      supervisor: undefined,
    });

  /* ---------------------------------------------------------------------------------- */

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      method,
      url,
      data,
    }: {
      method: string;
      url: string;
      data?: any;
      invalidateQueryKeys: any[][];
    }) => await authorizedAPI(url, { method, json: data }),
    onSuccess: (_data, variables) =>
      variables.invalidateQueryKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      ),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => await authorizedAPI.get(`api/users`).json(),
    retry: 1,
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", limit, offset],
    queryFn: async () =>
      (await authorizedAPI
        .get(`api/projects?limit=${limit}&offset=${offset}`)
        .json()) as { items: Project[]; totalCount: number },
    retry: 1,
  });

  /* ---------------------------------------------------------------------------------- */

  const handleCancelClick = () => {
    setProjectSupervisionModalState({ ...projectSupervisionModalState, open: false });
  };

  const handleCreateProjectClick = () => {
    setProjectSupervisionModalData({
      projectID: 0,
      title: "",
      description: "",
      student: undefined,
      supervisor: undefined,
    });
    setProjectSupervisionModalState({
      ...projectSupervisionModalState,
      mode: "create",
      open: true,
    });
  };

  const handleEditProjectClick = (selectedProject: Project) => {
    setProjectSupervisionModalData(selectedProject);
    setProjectSupervisionModalState({
      ...projectSupervisionModalState,
      mode: "edit",
      open: true,
    });
  };

  const handleArchiveProjectClick = (selectedProject: Project) => {
    setProjectSupervisionModalData(selectedProject);
    setProjectSupervisionModalState({
      ...projectSupervisionModalState,
      mode: "archive",
      open: true,
    });
  };

  const handleRestoreProjectClick = (selectedProject: Project) => {
    setProjectSupervisionModalData(selectedProject);
    setProjectSupervisionModalState({
      ...projectSupervisionModalState,
      mode: "restore",
      open: true,
    });
  };

  /* ---------------------------------------------------------------------------------- */

  const handleTitleChange = useCallback((title: string) => {
    setProjectSupervisionModalData((p) => ({ ...p, title: title }));
  }, []);

  const handleDescriptionChange = useCallback((description: string) => {
    setProjectSupervisionModalData((p) => ({
      ...p,
      description: description,
    }));
  }, []);

  const handleSupervisorChange = useCallback((selectedSupervisor?: User) => {
    setProjectSupervisionModalData((p) => ({
      ...p,
      supervisor: selectedSupervisor,
    }));
  }, []);

  const handleStudentChange = useCallback((selectedStudent?: User) => {
    setProjectSupervisionModalData((p) => ({
      ...p,
      student: selectedStudent,
    }));
  }, []);

  /* ---------------------------------------------------------------------------------- */

  const handleCreateProject = () => {
    mutation.mutate(
      {
        method: "post",
        url: `api/projects`,
        data: {
          ...projectSupervisionModalData,
          supervisorID: projectSupervisionModalData.supervisor?.userID,
          studentID: projectSupervisionModalData.student?.userID,
        },
        invalidateQueryKeys: [["projects", limit, offset]],
      },
      {
        onSettled: () =>
          setProjectSupervisionModalState({
            ...projectSupervisionModalState,
            open: false,
          }),
      },
    );
  };

  const handleEditProject = () => {
    mutation.mutate(
      {
        method: "put",
        url: `api/projects/${projectSupervisionModalData.projectID}`,
        data: {
          ...projectSupervisionModalData,
          supervisorID: projectSupervisionModalData.supervisor?.userID,
          studentID: projectSupervisionModalData.student?.userID,
        },
        invalidateQueryKeys: [["projects", limit, offset]],
      },
      {
        onSettled: () =>
          setProjectSupervisionModalState({
            ...projectSupervisionModalState,
            open: false,
          }),
      },
    );
  };

  const handleArchiveProject = () => {
    mutation.mutate(
      {
        method: "delete",
        url: `api/projects/${projectSupervisionModalData.projectID}`,
        data: {},
        invalidateQueryKeys: [["projects", limit, offset]],
      },
      {
        onSettled: () => {
          setProjectSupervisionModalState((p) => ({ ...p, open: false }));
        },
      },
    );
  };

  const handleRestoreProject = () => {
    mutation.mutate(
      {
        method: "put",
        url: `api/projects/${projectSupervisionModalData.projectID}/restore`,
        data: {},
        invalidateQueryKeys: [["projects", limit, offset]],
      },
      {
        onSettled: () => {
          setProjectSupervisionModalState((p) => ({ ...p, open: false }));
        },
      },
    );
  };
  /* ---------------------------------------------------------------------------------- */

  const students = users?.filter((u) => u.role == "student" && !u.isDeleted) ?? [];
  const supervisors = users?.filter((u) => u.role == "supervisor" && !u.isDeleted) ?? [];

  const formDataIncomplete = (() => {
    switch (projectSupervisionModalState.mode) {
      case "create":
      case "edit":
        return !(
          projectSupervisionModalData.title.trim() &&
          projectSupervisionModalData.student?.userID &&
          projectSupervisionModalData.supervisor?.userID
        );
      case "archive":
      case "restore":
        return false;
    }
  })();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: "12px",
        border: `1px solid ${theme.borderSoft}`,
        bgcolor: "white",
      }}>
      <TableLayout>
        <TableLayout.Header title="Project Supervision List">
          <TableLayout.AddButton text="Add Project" onClick={handleCreateProjectClick} />
        </TableLayout.Header>

        <ProjectList.Content>
          <ProjectSupervisionTable
            projects={projectsData?.items ?? []}
            isLoading={projectsLoading}
            totalCount={projectsData?.totalCount ?? 0}
            limit={limit}
            offset={offset}
            onPageChange={(newOffset) => setOffset(newOffset)}
            handleEditClick={handleEditProjectClick}
            handleArchiveClick={handleArchiveProjectClick}
            handleRestoreClick={handleRestoreProjectClick}
          />
        </ProjectList.Content>
      </TableLayout>

      <ProjectModal open={projectSupervisionModalState.open}>
        <ProjectModal.Header mode={projectSupervisionModalState.mode} />
        {projectSupervisionModalState.mode == "create" ||
        projectSupervisionModalState.mode == "edit" ? (
          <ProjectModal.Fields>
            {projectSupervisionModalState.mode == "edit" && (
              <ProjectModal.ProjectID projectID={projectSupervisionModalData.projectID} />
            )}
            <ProjectModal.ProjectTitle
              title={projectSupervisionModalData.title}
              handleTitleChange={handleTitleChange}
            />
            <ProjectModal.ProjectDescription
              description={projectSupervisionModalData.description ?? ""}
              handleDescriptionChange={handleDescriptionChange}
            />
            <ProjectModal.UserSelect
              label="Student"
              selectedUser={projectSupervisionModalData.student}
              users={students}
              handleUserChange={handleStudentChange}
            />
            <ProjectModal.UserSelect
              label="Supervisor"
              selectedUser={projectSupervisionModalData.supervisor}
              users={supervisors}
              handleUserChange={handleSupervisorChange}
            />
          </ProjectModal.Fields>
        ) : projectSupervisionModalState.mode == "archive" ? (
          <ProjectModal.ArchiveWarning />
        ) : (
          <ProjectModal.RestoreWarning />
        )}

        <ProjectModal.Actions
          isLoading={mutation.status == "pending"}
          mode={projectSupervisionModalState.mode}
          isValid={!formDataIncomplete}
          handleCancelClick={handleCancelClick}
          handleCreateProject={handleCreateProject}
          handleEditProject={handleEditProject}
          handleArchiveProject={handleArchiveProject}
          handleRestoreProject={handleRestoreProject}
        />
      </ProjectModal>
    </Paper>
  );
}
