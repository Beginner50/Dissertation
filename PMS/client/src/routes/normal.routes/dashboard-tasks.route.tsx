import { ProjectDetails } from "../../components/project.components/project-details.component";
import { TaskList } from "../../components/task.components.tsx/task-list.component";
import { useParams } from "react-router";
import type { Project, Task, TaskFormData, User } from "../../lib/types";
import { useCallback, useState } from "react";
import TaskModal, {
  type ModalState,
} from "../../components/task.components.tsx/task-modal.component";
import { Selector } from "../../components/base.components/selector.component";
import { useAuth } from "../../providers/auth.provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box } from "@mui/material";

export default function DashboardTasksRoute() {
  const { authState, authorizedAPI } = useAuth();
  const user = authState.user as User;

  const [taskModalState, setTaskModalState] = useState<ModalState>({
    mode: "create",
    open: false,
  });
  const [taskModalData, setTaskModalData] = useState<TaskFormData>({
    taskID: 0,
    title: "",
    description: "",
    dueDate: "",
  });

  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<User | undefined>(undefined);

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
        })
      ),
  });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["projects", projectID],
    queryFn: async (): Promise<Project> =>
      await authorizedAPI.get(`api/users/${user.userID}/projects/${projectID}`).json(),
    retry: 1,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: [projectID, "tasks"],
    queryFn: async (): Promise<Task[]> =>
      await authorizedAPI
        .get(`api/users/${user.userID}/projects/${projectID}/tasks`)
        .json(),
    retry: 1,
  });

  const { data: unsupervisedStudents, isLoading: unsupervisedStudentsLoading } = useQuery(
    {
      queryKey: [user.userID, "users", "unsupervised"],
      queryFn: async (): Promise<User[]> =>
        await authorizedAPI.get(`api/users/unsupervised`).json(),
      retry: 1,
    }
  );

  /* ---------------------------------------------------------------------------------- */

  const handleSelectStudent = (student: User) => {
    setSelectedStudent(student);
    console.log(selectedStudent);
  };

  const handleCancelClick = () => {
    setTaskModalData({
      taskID: 0,
      title: "",
      description: "",
      dueDate: "",
    });
    setSelectedStudent(undefined);
    setTaskModalState((t) => ({ ...t, open: false }));
  };

  const handleCreateTaskClick = () => {
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

  const handleAddStudentClick = () => {
    setTaskModalState((t) => ({ ...t, mode: "add-student", open: true }));
  };

  /* ---------------------------------------------------------------------------------- */

  const handleSearchChange = useCallback((searchTerm: string) => {
    setStudentSearchTerm(searchTerm);
  }, []);
  const handleTitleChange = useCallback((title: string) => {
    setTaskModalData((t) => ({ ...t, title: title }));
  }, []);
  const handleDescriptionChange = useCallback((description: string) => {
    setTaskModalData((t) => ({ ...t, description: description }));
  }, []);
  const handleDueDateChange = useCallback((dueDate: string) => {
    setTaskModalData((t) => ({ ...t, dueDate: dueDate }));
  }, []);

  /* ---------------------------------------------------------------------------------- */

  const handleCreateTask = () => {
    mutation.mutate({
      method: "post",
      url: `api/users/${user.userID}/projects/${projectID}/tasks`,
      data: taskModalData,
      invalidateQueryKeys: [[projectID, "tasks"]],
    });
    setTaskModalState((t) => ({ ...t, open: false }));
  };

  const handleEditTask = () => {
    mutation.mutate({
      method: "put",
      url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskModalData.taskID}`,
      data: taskModalData,
      invalidateQueryKeys: [[projectID, "tasks"]],
    });
    setTaskModalState((t) => ({ ...t, open: false }));
  };

  const handleDeleteTask = () => {
    mutation.mutate({
      method: "delete",
      url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskModalData.taskID}`,
      data: taskModalData,
      invalidateQueryKeys: [[projectID, "tasks"]],
    });
    setTaskModalState((t) => ({ ...t, open: false }));
  };

  const handleAddStudent = () => {
    mutation.mutate({
      method: "put",
      url: `api/users/${user.userID}/projects/${projectID}/add-student/${selectedStudent?.userID}`,
      data: {},
      invalidateQueryKeys: [
        ["projects", projectID],
        [user.userID.toString(), "users", "unsupervised"],
      ],
    });
    setTaskModalState((t) => ({ ...t, open: false }));
  };

  const handleGenerateProgressLogReport = async () => {
    const response = await authorizedAPI
      .get(`api/users/${user.userID}/projects/${projectID}/progress-log`)
      .blob();

    // 2. Create a temporary URL for the blob
    const url = window.URL.createObjectURL(response);

    // 3. Create a hidden anchor element to trigger the download
    const link = document.createElement("a");
    link.href = url;

    // You can customize the filename here or try to get it from headers
    link.setAttribute("download", `Project_${projectID}_ProgressLog.pdf`);

    document.body.appendChild(link);
    link.click();

    // 4. Cleanup
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  /* ---------------------------------------------------------------------------------- */

  const filteredStudents = unsupervisedStudents?.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      s.userID.toString().toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  const formDataIncomplete = (() => {
    switch (taskModalState.mode) {
      case "create":
      case "edit":
        return Object.entries(taskModalData).some(([key, val]) => {
          if (typeof val == "number") return Number.isNaN(val);
          if (key == "description") return false;
          return val == "";
        });
      case "add-student":
        return selectedStudent == null;
      case "delete":
        return false;
    }
  })();

  /* ---------------------------------------------------------------------------------- */

  const modalViews = {
    create: (
      <TaskModal.Fields>
        <TaskModal.TaskTitle
          title={taskModalData.title}
          handleTitleChange={handleTitleChange}
        />
        <TaskModal.TaskDescription
          description={taskModalData.description ?? ""}
          handleDescriptionChange={handleDescriptionChange}
        />
        <TaskModal.DueDate
          dueDate={taskModalData.dueDate}
          handleDueDateChange={handleDueDateChange}
        />
      </TaskModal.Fields>
    ),
    edit: (
      <TaskModal.Fields>
        <TaskModal.TaskID taskID={taskModalData.taskID} />
        <TaskModal.TaskTitle
          title={taskModalData.title}
          handleTitleChange={handleTitleChange}
        />
        <TaskModal.TaskDescription
          description={taskModalData.description ?? ""}
          handleDescriptionChange={handleDescriptionChange}
        />
        <TaskModal.DueDate
          dueDate={taskModalData.dueDate}
          handleDueDateChange={handleDueDateChange}
        />
      </TaskModal.Fields>
    ),
    "add-student": (
      <Selector>
        <Selector.Search
          searchTerm={studentSearchTerm}
          placeholder="Search for students..."
          handleSearchChange={handleSearchChange}
        />
        <Selector.Content>
          {filteredStudents && filteredStudents.length > 0 ? (
            filteredStudents.map((s) => (
              <Selector.StudentListEntry
                student={s}
                isSelected={selectedStudent?.userID == s.userID}
                handleSelectStudent={() => handleSelectStudent(s)}
              />
            ))
          ) : (
            <Selector.NotFound placeholder="No students match your search" />
          )}
        </Selector.Content>
      </Selector>
    ),
    delete: <TaskModal.DeleteWarning />,
  };

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

          <TaskList.Content
            isLoading={tasksLoading}
            projectID={projectID}
            tasks={tasks ?? []}
            menuEnabled={user.role === "supervisor"}
            handleEditTaskClick={handleEditTaskClick}
            handleDeleteTaskClick={handleDeleteTaskClick}
          />
        </TaskList>

        {/* Right Section - Project Details */}
        <ProjectDetails sx={{ flexGrow: 1 }}>
          <ProjectDetails.Header
            title={project?.title ?? ""}
            description={project?.description ?? ""}
          />
          <ProjectDetails.MemberInformation
            student={project?.student}
            supervisor={project?.supervisor}
          />
          <ProjectDetails.Actions>
            <ProjectDetails.GenerateProgressLogReportButton
              handleGenerateProgressLogReport={handleGenerateProgressLogReport}
            />
            {user.role == "supervisor" && (
              <ProjectDetails.AddStudentButton
                isStudentAssigned={!!project?.student}
                handleAddStudentClick={handleAddStudentClick}
              />
            )}
          </ProjectDetails.Actions>
        </ProjectDetails>
      </Box>

      {/* Task Modal */}
      <TaskModal open={taskModalState.open}>
        <TaskModal.Header mode={taskModalState.mode} />

        {modalViews[taskModalState.mode]}

        <TaskModal.Actions
          mode={taskModalState.mode}
          disabled={formDataIncomplete}
          handleCancelClick={handleCancelClick}
          handleCreateTask={handleCreateTask}
          handleEditTask={handleEditTask}
          handleDeleteTask={handleDeleteTask}
          handleAddStudent={handleAddStudent}
        />
      </TaskModal>
    </>
  );
}
