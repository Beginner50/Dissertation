import { ProjectDetails } from "../../components/project.components/project-details.component";
import { TaskList } from "../../components/task-list.components.tsx/task-list.component";
import { user, origin } from "../../lib/temp";
import { useParams } from "react-router";
import type { TaskFormData, User } from "../../lib/types";
import { useState } from "react";
import TaskModal, {
  type ModalState,
} from "../../components/task-list.components.tsx/task-modal.component";
import { useSingleProjectQuery } from "../../lib/hooks/useProjectsQuery";
import { useTaskMutation } from "../../lib/hooks/useTaskMutation";
import { useTasksQuery } from "../../lib/hooks/usetasksQuery";
import { Selector } from "../../components/base.components/selectors.component";

export default function DashboardTasksRoute() {
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
  const [selectedStudent, setSelectedStudent] = useState<User>();

  const taskMutation = useTaskMutation();

  const { projectID } = useParams();
  const { data: project, isLoading: projectLoading } =
    useSingleProjectQuery(projectID);
  const { data: tasks, isLoading: tasksLoading } = useTasksQuery(projectID);

  /* ---------------------------------------------------------------------------------- */

  const handleCancelClick = () => {
    setTaskModalData({
      taskID: 0,
      title: "",
      description: "",
      dueDate: "",
    });
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

  /* ---------------------------------------------------------------------------------- */

  const handleSearchChange = (searchTerm: string) => {
    setStudentSearchTerm(searchTerm);
  };
  const handleTitleChange = (title: string) => {
    setTaskModalData((t) => ({ ...t, title: title }));
  };
  const handleDescriptionChange = (description: string) => {
    setTaskModalData((t) => ({ ...t, description: description }));
  };
  const handleDueDateChange = (dueDate: string) => {
    setTaskModalData((t) => ({ ...t, dueDate: dueDate }));
  };

  /* ---------------------------------------------------------------------------------- */

  const handleCreateTask = () => {
    taskMutation.mutate({
      method: "post",
      url: `${origin}/api/users/${user.userID}/projects/${projectID}/tasks`,
      data: taskModalData,
    });
    setTaskModalState((t) => ({ ...t, open: false }));
  };

  const handleEditTask = () => {
    taskMutation.mutate({
      method: "put",
      url: `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskModalData.taskID}`,
      data: taskModalData,
    });
    setTaskModalState((t) => ({ ...t, open: false }));
  };

  const handleDeleteTask = () => {
    taskMutation.mutate({
      method: "delete",
      url: `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskModalData.taskID}`,
      data: taskModalData,
    });
    setTaskModalState((t) => ({ ...t, open: false }));
  };

  const handleAddStudent = () => {};

  const handleGenerateProgressLogReport = () => {};

  /* ---------------------------------------------------------------------------------- */

  // const filteredStudents = projects?.filter(
  //   (p) =>
  //     p.title.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
  //     p.student?.name.toLowerCase().includes(projectSearchTerm.toLowerCase())
  // );

  const isFormInvalid = Object.entries(taskModalData).some(([key, val]) => {
    if (typeof val == "number") return Number.isNaN(val);
    if (key == "description") return false;
    return val == "";
  });

  return (
    <>
      <TaskList
        sx={{
          flexGrow: 3,
          overflowY: "auto",
          flexDirection: "column",
        }}
      >
        <TaskList.Header>
          <TaskList.CreateTaskButton onClick={handleCreateTaskClick} />
        </TaskList.Header>

        {!tasksLoading && (
          <TaskList.List
            projectID={parseInt(projectID ?? "")}
            tasks={tasks ?? []}
            handleEditTaskClick={handleEditTaskClick}
            handleDeleteTaskClick={handleDeleteTaskClick}
          />
        )}
      </TaskList>

      <ProjectDetails
        sx={{
          flexGrow: 1,
          maxWidth: "30vw",
          minHeight: "45vh",
          height: "fit-content",
        }}
      >
        <ProjectDetails.Header
          title={project?.title ?? ""}
          description={project?.description ?? ""}
        >
          <ProjectDetails.MemberInformation
            student={project?.student}
            supervisor={project?.supervisor}
          />
        </ProjectDetails.Header>

        <ProjectDetails.Actions
          isStudentAssigned={!!project?.student}
          handleGenerateProgressLogReport={handleGenerateProgressLogReport}
          onAddStudent={() => {}}
        />
      </ProjectDetails>

      <TaskModal open={taskModalState.open}>
        <TaskModal.Header mode={taskModalState.mode} />
        {(taskModalState.mode == "create" || taskModalState.mode == "edit") && (
          <TaskModal.Fields>
            <TaskModal.TaskID
              taskID={taskModalData.taskID}
              visible={taskModalState.mode == "edit"}
            />
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
        )}

        {taskModalState.mode == "add-student" && (
          <Selector>
            <Selector.Search
              searchTerm={studentSearchTerm}
              placeholder="Search for students..."
              handleSearchChange={handleSearchChange}
            />
            {/* <Selector.StudentList  /> */}
          </Selector>
        )}

        {taskModalState.mode == "delete" && <TaskModal.DeleteWarning />}

        <TaskModal.Actions
          mode={taskModalState.mode}
          disabled={isFormInvalid && taskModalState.mode != "delete"}
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
