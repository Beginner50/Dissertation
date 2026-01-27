import { ProjectList } from "../../components/project.components/project-list.component";
import { ReminderList } from "../../components/notification-reminder.components/reminder-list.component";
import type {
  Notification,
  Project,
  ProjectFormData,
  Reminder,
  User,
} from "../../lib/types";
import { useCallback, useState } from "react";
import ProjectModal, {
  type ModalMode,
  type ModalState as ProjectModalState,
} from "../../components/project.components/project-modal.component";
import { Selector } from "../../components/base.components/selector.component";
import { SlidingActivityCard } from "../../components/base.components/sliding-activity-card.component";
import { NotificationList } from "../../components/notification-reminder.components/notification-list.component";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../providers/auth.provider";
import { Box } from "@mui/material";
import Pagination from "../../components/base.components/pagination.component";

export default function DashboardProjectsRoute() {
  /* ------------------------------- React Hooks --------------------------------------- */
  const { authState, authorizedAPI } = useAuth();
  const user = authState.user as User;

  const [projectListLimit, setProjectListLimit] = useState(5);
  const [projectListOffset, setProjectListOffset] = useState(0);
  const [step, setStep] = useState(0);

  const [projectModalState, setProjectModalState] = useState<ProjectModalState>({
    mode: "create",
    open: false,
  });
  const [projectModalData, setProjectModalData] = useState<ProjectFormData>({
    projectID: 0,
    title: "",
    description: "",
  });

  /* ---------------------------------------------------------------------------------- */
  /*
    More information: https://tanstack.com/query/latest/docs/framework/react/overview

    Tanstack query is a popular library for managing server state, syncing server side data
    from APIs with the client side components. 

    The way it works is that whenever a component re-renders, queries first serve data from
    the cache while fetching data in the background, ensuring UI remains responsive. The 
    problems that this approach solves is listed in the link above.

    There are 3 core concepts in Tanstack Query:
    1) Queries
       A Query is a dependency on an asynchronous source of data that is tied to a unique key.

       For example, given a query has key [user.userID, "projects"], whenever the userID changes,
       tanstack query will trigger a new render cycle to fetch the data.
      
    2) Mutations
       Mutations represent side effects that modify data on the server (POST, PATCH, DELETE)

    3) Query Invalidation
       Mutations are generally followed by query invalidation, whereby keys can be marked as
       stale to force the corresponding queries to re-fetch data automatically.
      
    Since queries and mutations operate on a global state, they can communicate from separate
    components, allowing queries invalidated from one component to affect other mounted
    components elsewhere. 
  */

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      method,
      url,
      data,
    }: {
      method: string;
      url: string;
      data: any;
      invalidateQueryKeys: any[][];
    }) => await authorizedAPI(url, { method: method, json: data }),
    onSuccess: (_data, variables) =>
      variables.invalidateQueryKeys.forEach((key) =>
        queryClient.invalidateQueries({
          queryKey: key,
        }),
      ),
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: [user.userID, "projects", projectListLimit, projectListOffset],
    queryFn: async (): Promise<{ items: Project[]; totalCount: number }> =>
      await authorizedAPI
        .get(`api/users/${user.userID}/projects`, {
          searchParams: { limit: projectListLimit, offset: projectListOffset },
        })
        .json(),
    retry: 1,
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: [user.userID, "reminders"],
    queryFn: async (): Promise<Reminder[]> =>
      await authorizedAPI.get(`api/users/${user.userID}/reminders`).json(),
    retry: 1,
    refetchInterval: 1000 * 60, // 1 minute
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: [user.userID, "notifications"],
    queryFn: async (): Promise<Notification[]> =>
      await authorizedAPI.get(`api/users/${user.userID}/notifications`).json(),
    retry: 1,
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  /* ---------------------------------------------------------------------------------- */

  const handleCreateProjectClick = () => {
    setProjectModalState((ms) => ({ ...ms, mode: "create", open: true }));
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

  const handlePageChange = (newOffset: number) => {
    setProjectListOffset(newOffset);
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

  /* ---------------------------------------------------------------------------------- */

  const handleCreateProject = () => {
    mutation.mutate(
      {
        method: "post",
        url: `api/users/${user.userID}/projects`,
        data: projectModalData,
        invalidateQueryKeys: [
          [user.userID, "projects", projectListLimit, projectListOffset],
        ],
      },
      {
        onSuccess: () => {
          setProjectModalState((p) => ({ ...p, open: false }));
        },
      },
    );
  };

  const handleEditProject = () => {
    mutation.mutate(
      {
        method: "put",
        url: `api/users/${user.userID}/projects/${projectModalData.projectID}`,
        data: projectModalData,
        invalidateQueryKeys: [
          [user.userID, "projects", projectListLimit, projectListOffset],
        ],
      },
      {
        onSuccess: () => {
          setProjectModalState((p) => ({ ...p, open: false }));
        },
      },
    );
  };

  const handleArchiveProject = () => {
    mutation.mutate(
      {
        method: "delete",
        url: `api/users/${user.userID}/projects/${projectModalData.projectID}`,
        data: {},
        invalidateQueryKeys: [
          [user.userID, "projects", projectListLimit, projectListOffset],
        ],
      },
      {
        onSuccess: () => {
          setProjectModalState((p) => ({ ...p, open: false }));
        },
      },
    );
  };

  /* ---------------------------------------------------------------------------------- */

  const formDataIncomplete = (() => {
    switch (projectModalState.mode) {
      case "create":
      case "edit":
        return Object.entries(projectModalData).some(([key, val]) => {
          if (typeof val == "number") return Number.isNaN(val);
          return val == "";
        });
      case "archive":
        return false;
    }
  })();

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "row",
          marginLeft: "4.5vw",
          marginRight: "3vw",
          marginBottom: "2vh",
          columnGap: "2vw",
        }}>
        {/* Left Section - Projects */}
        <ProjectList>
          <ProjectList.Header>
            {user.role == "supervisor" && (
              <ProjectList.CreateProjectButton
                handleCreateProjectClick={handleCreateProjectClick}
              />
            )}
          </ProjectList.Header>

          <ProjectList.Content
            isLoading={projectsLoading}
            projects={projects?.items ?? []}
            menuEnabled={user.role === "supervisor"}
            handleEditProjectClick={handleEditProjectClick}
            handleArchiveProjectClick={handleArchiveProjectClick}
          />
          <Pagination
            totalCount={projects?.totalCount ?? 0}
            limit={projectListLimit}
            offset={projectListOffset}
            onPageChange={handlePageChange}
          />
        </ProjectList>

        {/* Right Section - Sliding Activity (Reminder + Notifications) */}
        <SlidingActivityCard>
          <SlidingActivityCard.Content activeStep={step}>
            <NotificationList notifications={notifications ?? []} />
            <ReminderList reminders={reminders ?? []} />
          </SlidingActivityCard.Content>

          <SlidingActivityCard.Navigation
            activeStep={step}
            onNext={() => setStep(1)}
            onBack={() => setStep(0)}
          />
        </SlidingActivityCard>
      </Box>

      {/* Project Modal */}
      <ProjectModal open={projectModalState.open}>
        <ProjectModal.Header mode={projectModalState.mode} />

        {projectModalState.mode === "create" || projectModalState.mode === "edit" ? (
          <ProjectModal.Fields>
            <ProjectModal.ProjectID
              projectID={projectModalData?.projectID ?? 0}
              visible={projectModalState.mode === "edit"}
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
        ) : (
          <ProjectModal.ArchiveWarning />
        )}

        <ProjectModal.Actions
          mode={projectModalState.mode}
          isLoading={mutation.status === "pending"}
          isValid={!formDataIncomplete}
          handleCancelClick={handleCancelClick}
          handleCreateProject={handleCreateProject}
          handleEditProject={handleEditProject}
          handleArchiveProject={handleArchiveProject}
        />
      </ProjectModal>
    </>
  );
}
