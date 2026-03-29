import { ProjectList } from "../../components/project.components/project-list.component";
import { ReminderList } from "../../components/reminder.components/reminder-list.component";
import type {
  ModalState,
  OutletContext,
  Project,
  ProjectFormData,
  Reminder,
  User,
} from "../../lib/types";
import ProjectModal from "../../components/base.components/modal.component";
import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../providers/auth.provider";
import { Box } from "@mui/material";
import Pagination from "../../components/base.components/pagination.component";
import ProjectListEntry from "../../components/project.components/project-list-entry.component";
import { useOutletContext, useSearchParams } from "react-router";
import { extractErrorMessage } from "../../lib/utils";

export default function DashboardProjectsRoute() {
  const [searchParams] = useSearchParams();
  const { setErrorMessage } = useOutletContext<OutletContext>();

  /* ------------------------------- React Hooks --------------------------------------- */
  const { authState, authorizedAPI } = useAuth();
  const user = authState.user as User;

  const [projectListLimit] = useState(() => {
    const pageSize = Number(searchParams.get("page-size"));
    return !isNaN(pageSize) && pageSize != 0 ? pageSize : 4;
  });
  const [projectListOffset, setProjectListOffset] = useState(0);

  const [projectModalState, setProjectModalState] = useState<ModalState>({
    // mode: "create",
    mode: "edit",
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
    select: (data: any[]): Reminder[] => {
      return data.map((r) => ({
        ...r,
        remindAt: new Date(r.remindAt),
      }));
    },
    retry: 1,
    refetchInterval: 1000 * 60, // 1 minute
  });

  /* ---------------------------------------------------------------------------------- */

  // const handleCreateProjectClick = () => {
  //   setProjectModalState((ms) => ({ ...ms, mode: "create", open: true }));
  // };

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

  // const handleCreateProject = () => {
  //   mutation.mutate(
  //     {
  //       method: "post",
  //       url: `api/users/${user.userID}/projects`,
  //       data: projectModalData,
  //       invalidateQueryKeys: [
  //         [user.userID, "projects", projectListLimit, projectListOffset],
  //       ],
  //     },
  //     {
  //       onSettled: () => {
  //         setProjectModalState((p) => ({ ...p, open: false }));
  //       },
  //     },
  //   );
  // };

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
        onSettled: () => {
          setProjectModalState((p) => ({ ...p, open: false }));
        },
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to update project details.");
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
        onSettled: () => {
          setProjectModalState((p) => ({ ...p, open: false }));
        },
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to archive project.");
          setProjectModalState((p) => ({ ...p, open: false }));
        },
      },
    );
  };

  /* ---------------------------------------------------------------------------------- */

  const formDataIncomplete = (() => {
    switch (projectModalState.mode) {
      // case "create":
      case "edit":
        return !(projectModalData.projectID && projectModalData.title);
      case "archive":
        return false;
      default:
        return true;
    }
  })();

  const activeProjects = projects?.items.filter((p) => !p.isArchived);

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
          <ProjectList.Header />

          <ProjectList.Content>
            {projectsLoading ? (
              <ProjectList.Loading />
            ) : activeProjects?.length === 0 ? (
              <ProjectList.NotFound message="You are not a member of any projects yet." />
            ) : (
              activeProjects?.map((project) => (
                <ProjectListEntry
                  key={project.projectID}
                  project={project}
                  url={`/projects/${project.projectID}/tasks?${searchParams.toString()}`}
                  menuEnabled={user.role === "supervisor"}
                  onEdit={() => handleEditProjectClick(project)}
                  onArchive={() => handleArchiveProjectClick(project)}
                />
              ))
            )}
          </ProjectList.Content>

          <Pagination
            totalCount={projects?.totalCount ?? 0}
            limit={projectListLimit}
            offset={projectListOffset}
            onPageChange={handlePageChange}
          />
        </ProjectList>

        {/* Right Section - Reminders  */}
        <ReminderList reminders={reminders ?? []} />
      </Box>

      {/* Project Modal */}
      <ProjectModal open={projectModalState.open}>
        <ProjectModal.Header mode={projectModalState.mode} item="Project" />
        {
          // projectModalState.mode === "create" ||
          projectModalState.mode === "edit" ? (
            <ProjectModal.Fields>
              {projectModalState.mode == "edit" && (
                <ProjectModal.TextField
                  label="ProjectID"
                  value={projectModalData.projectID}
                  disabled
                />
              )}
              <ProjectModal.TextField
                label="Title"
                value={projectModalData.title}
                handleValueChange={handleTitleChange}
              />
              <ProjectModal.TextField
                label="Description"
                value={projectModalData.description ?? ""}
                handleValueChange={handleDescriptionChange}
                multiline
                rows={3}
              />
            </ProjectModal.Fields>
          ) : (
            <ProjectModal.Warning message="This action cannot be undone by the supervisor! Contact your administrator to restore an archived project." />
          )
        }

        <ProjectModal.Actions
          mode={projectModalState.mode}
          disabled={formDataIncomplete || mutation.isPending}
          loading={mutation.status == "pending"}
          handleCancelClick={handleCancelClick}
          handleEditItem={handleEditProject}
          handleArchiveItem={handleArchiveProject}
        />
      </ProjectModal>
    </>
  );
}
