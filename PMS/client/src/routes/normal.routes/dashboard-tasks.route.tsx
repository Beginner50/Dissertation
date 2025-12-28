import { ProjectDetails } from "../../components/project.components/project-details.component";
import { TaskList } from "../../components/task-list.components.tsx/task-list.component";
import { user, origin } from "../../lib/temp";
import { useParams } from "react-router";
import type { TaskFormData, User } from "../../lib/types";
import { useCallback, useState } from "react";
import TaskModal, {
  type ModalState,
} from "../../components/task-list.components.tsx/task-modal.component";
import { useSingleProjectQuery } from "../../lib/hooks/useProjectsQuery";
import { useTaskMutation } from "../../lib/hooks/useTaskMutation";
import { useTasksQuery } from "../../lib/hooks/useTasksQuery";
import { Selector } from "../../components/base.components/selector.component";
import { useUserMutation } from "../../lib/hooks/useUserMutation";
import { useUnsupervisedStudentsQuery } from "../../lib/hooks/useUsersQuery";

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
  const [selectedStudent, setSelectedStudent] = useState<User | undefined>(
    undefined
  );

  const taskMutation = useTaskMutation();
  const userMutation = useUserMutation();

  const { projectID } = useParams();
  const { data: project, isLoading: projectLoading } = useSingleProjectQuery({
    projectID,
  });
  const { data: tasks, isLoading: tasksLoading } = useTasksQuery({ projectID });
  const { data: unsupervisedStudents, isLoading: unsupervisedStudentsLoading } =
    useUnsupervisedStudentsQuery();

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

  const filteredStudents = unsupervisedStudents?.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      s.userID
        .toString()
        .toLowerCase()
        .includes(studentSearchTerm.toLowerCase())
  );

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
          {user.role == "supervisor" && (
            <TaskList.CreateTaskButton onClick={handleCreateTaskClick} />
          )}
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
            <Selector.List>
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
            </Selector.List>
          </Selector>
        )}

        {taskModalState.mode == "delete" && <TaskModal.DeleteWarning />}

        <TaskModal.Actions
          mode={taskModalState.mode}
          disabled={
            (isFormInvalid &&
              (taskModalState.mode == "create" ||
                taskModalState.mode == "edit")) ||
            (selectedStudent == undefined &&
              taskModalState.mode == "add-student")
          }
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
