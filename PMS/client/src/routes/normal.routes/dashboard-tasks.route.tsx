import { ProjectDetails } from "../../components/project.components/project-details.component";
import { TaskList } from "../../components/task.components.tsx/task-list.component";
import { useOutletContext, useParams, useSearchParams } from "react-router";
import type {
  ModalState,
  OutletContext,
  Project,
  Task,
  TaskFormData,
  User,
} from "../../lib/types";
import { useCallback, useState } from "react";
import TaskModal from "../../components/base.components/modal.component";
import { useAuth } from "../../providers/auth.provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box } from "@mui/material";
import Pagination from "../../components/base.components/pagination.component";
import TaskListEntry from "../../components/task.components.tsx/task-list-entry.component";
import { extractErrorMessage } from "../../lib/utils";

export default function DashboardTasksRoute() {
  const { setErrorMessage } = useOutletContext<OutletContext>();
  const [searchParams] = useSearchParams();

  const { authState, authorizedAPI } = useAuth();
  const user = authState.user as User;

  const [taskListLimit, setTaskListLimit] = useState(() => {
    const pageSize = Number(searchParams.get("page-size"));
    return !isNaN(pageSize) && pageSize != 0 ? pageSize : 4;
  });
  const [taskListOffset, setTaskListOffset] = useState(0);

  const [taskModalState, setTaskModalState] = useState<ModalState>({
    mode: "create",
    open: false,
  });
  const [taskModalData, setTaskModalData] = useState<TaskFormData>({
    taskID: 0,
    title: "",
    description: "",
    dueDate: new Date(),
  });

  const { projectID } = useParams();

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

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["projects", projectID],
    queryFn: async (): Promise<Project> =>
      await authorizedAPI.get(`api/users/${user.userID}/projects/${projectID}`).json(),
    retry: 1,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: [projectID, "tasks", taskListOffset, taskListLimit],
    queryFn: async (): Promise<{ items: Task[]; totalCount: number }> =>
      await authorizedAPI
        .get(`api/users/${user.userID}/projects/${projectID}/tasks`, {
          searchParams: {
            limit: taskListLimit,
            offset: taskListOffset,
          },
        })
        .json(),
    select: (data) => ({
      ...data,
      items: data.items.map((t: any) => ({
        ...t,
        assignedDate: new Date(t.assignedDate),
        dueDate: new Date(t.dueDate),
      })),
    }),
    retry: 1,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minute
  });

  /* ---------------------------------------------------------------------------------- */

  const handleCancelClick = () => {
    setTaskModalData({
      taskID: 0,
      title: "",
      description: "",
      dueDate: new Date(),
    });
    setTaskModalState((t) => ({ ...t, open: false }));
  };

  const handleCreateTaskClick = () => {
    setTaskModalData({
      taskID: 0,
      title: "",
      description: "",
      dueDate: new Date(),
    });
    setTaskModalState((t) => ({ ...t, mode: "create", open: true }));
  };

  const handleEditTaskClick = (taskData: TaskFormData) => {
    setTaskModalData(taskData);
    setTaskModalState((t) => ({ ...t, mode: "edit", open: true }));
  };

  const handleDeleteTaskClick = (taskData: TaskFormData) => {
    setTaskModalData(taskData);
    setTaskModalState((t) => ({ ...t, mode: "delete", open: true }));
  };

  const handlePageChange = (newOffset: number) => {
    setTaskListOffset(newOffset);
  };

  /* ---------------------------------------------------------------------------------- */

  const handleTitleChange = useCallback((title: string) => {
    setTaskModalData((t) => ({ ...t, title: title }));
  }, []);
  const handleDescriptionChange = useCallback((description: string) => {
    setTaskModalData((t) => ({ ...t, description: description }));
  }, []);
  const handleDueDateChange = useCallback((dueDate: Date | null) => {
    if (dueDate != null) setTaskModalData((t) => ({ ...t, dueDate: dueDate }));
  }, []);

  /* ---------------------------------------------------------------------------------- */

  const handleCreateTask = () => {
    console.log("Stared Create");
    mutation.mutate(
      {
        method: "post",
        url: `api/users/${user.userID}/projects/${projectID}/tasks`,
        data: { ...taskModalData, dueDate: taskModalData.dueDate.toISOString() },
        invalidateQueryKeys: [[projectID, "tasks", taskListOffset, taskListLimit]],
      },
      {
        onSettled: () => {
          setTaskModalState((t) => ({ ...t, open: false }));
        },
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to create task.");
        },
      },
    );
  };

  const handleEditTask = () => {
    mutation.mutate(
      {
        method: "put",
        url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskModalData.taskID}`,
        data: { ...taskModalData, dueDate: taskModalData.dueDate.toISOString() },
        invalidateQueryKeys: [[projectID, "tasks", taskListOffset, taskListLimit]],
      },
      {
        onSettled: () => {
          setTaskModalState((t) => ({ ...t, open: false }));
        },
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to update task details.");
        },
      },
    );
  };

  const handleDeleteTask = () => {
    mutation.mutate(
      {
        method: "delete",
        url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskModalData.taskID}`,
        data: { ...taskModalData, dueDate: taskModalData.dueDate.toISOString() },
        invalidateQueryKeys: [[projectID, "tasks", taskListOffset, taskListLimit]],
      },
      {
        onSettled: () => {
          setTaskModalState((t) => ({ ...t, open: false }));
        },
        onError: async (err: any) => {
          const msg = await extractErrorMessage(err);
          setErrorMessage(msg || "Failed to delete task.");
        },
      },
    );
  };

  /*
    The pdf file sent from the server is fetched and stored as an BLOB (Binary Large Object)
    object in memory.

    Since the browser cannot directly open BLOB objects, a temporary URL is created using the
    URL.createObjectURL() method, which generates a unique URL that points to the BLOB data.

    window.open() is then used to open this temporary URL in a new browser tab. 

      The "_blank" parameter specifies that the URL should be opened in a new tab,
      while "noopener,noreferrer" are security features to prevent the new page from
      accessing the original page's window object and prevent security vulnerabilities.

      For example, a malicious file will not be able to use window.open to redirect
      the original page to a phishing site.
  */
  const handleGenerateProgressLogReport = async () => {
    try {
      const response = await authorizedAPI.get(
        `api/users/${user.userID}/projects/${projectID}/progress-log`,
      );
      const blob = await response.blob();
      const fileURL = window.URL.createObjectURL(blob);

      window.open(fileURL, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        window.URL.revokeObjectURL(fileURL);
      }, 1000 * 30);
    } catch (error) {
      console.error("Could not generate progress log report!");
      setErrorMessage("Failed to generate progress log report!");
    }
  };

  /* ---------------------------------------------------------------------------------- */

  const formDataIncomplete = (() => {
    switch (taskModalState.mode) {
      case "create":
      case "edit":
        if (taskModalData.title == "") return true;
        return false;
      case "delete":
        return false;
    }
  })();

  /* ---------------------------------------------------------------------------------- */

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
        {/* Left Section - Tasks */}
        <TaskList sx={{ flexGrow: 3 }}>
          <TaskList.Header>
            {user.role == "supervisor" && (
              <TaskList.CreateTaskButton onClick={handleCreateTaskClick} />
            )}
          </TaskList.Header>

          <TaskList.Content>
            {tasksLoading ? (
              <TaskList.Loading />
            ) : tasks?.items.length === 0 ? (
              <TaskList.NotFound message="No tasks have been created for this project yet." />
            ) : (
              tasks?.items.map((task) => (
                <TaskListEntry
                  key={task.taskID}
                  task={task}
                  projectID={projectID}
                  menuEnabled={user.role === "supervisor"}
                  onEdit={() => handleEditTaskClick(task)}
                  onDelete={() => handleDeleteTaskClick(task)}
                />
              ))
            )}
          </TaskList.Content>

          <Pagination
            totalCount={tasks?.totalCount ?? 0}
            limit={taskListLimit}
            offset={taskListOffset}
            onPageChange={handlePageChange}
          />
        </TaskList>

        {/* Right Section - Project Details */}
        <ProjectDetails sx={{ flexGrow: 1 }}>
          <ProjectDetails.Header
            title={project?.title ?? ""}
            description={project?.description ?? ""}
          />
          <ProjectDetails.MemberInformation
            student={project?.students[0]}
            supervisor={project?.supervisors[0]}
          />

          <ProjectDetails.Actions>
            <ProjectDetails.GenerateProgressLogReportButton
              handleGenerateProgressLogReport={handleGenerateProgressLogReport}
            />
          </ProjectDetails.Actions>
        </ProjectDetails>
      </Box>

      {/* Task Modal */}
      <TaskModal open={taskModalState.open}>
        <TaskModal.Header mode={taskModalState.mode} item="Task" />

        {taskModalState.mode != "delete" ? (
          <TaskModal.Fields>
            {taskModalState.mode == "edit" && (
              <TaskModal.TextField
                label={"taskID"}
                value={taskModalData.taskID}
                disabled
              />
            )}
            <TaskModal.TextField
              label={"Title"}
              value={taskModalData.title ?? ""}
              handleValueChange={handleTitleChange}
            />
            <TaskModal.TextField
              label={"Description"}
              value={taskModalData.description ?? ""}
              handleValueChange={handleDescriptionChange}
            />
            <TaskModal.DateTimePicker
              label="Due Date"
              value={taskModalData.dueDate}
              handleValueChange={handleDueDateChange}
            />
          </TaskModal.Fields>
        ) : (
          <TaskModal.Warning message="This action is permanent and cannot be undone!" />
        )}

        <TaskModal.Actions
          mode={taskModalState.mode}
          loading={mutation.status === "pending"}
          disabled={formDataIncomplete || mutation.isPending}
          handleCancelClick={handleCancelClick}
          handleCreateItem={handleCreateTask}
          handleEditItem={handleEditTask}
          handleDeleteItem={handleDeleteTask}
        />
      </TaskModal>
    </>
  );
}
