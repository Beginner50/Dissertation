import FeedbackCriteriaTable from "../../components/feedback.components/feedback-criteria-table.component";
import * as base64js from "base64-js";
import TaskActions from "../../components/task.components.tsx/task-actions.component";
import { TaskDetails } from "../../components/task.components.tsx/task-details.component";
import { useCallback, useEffect, useState } from "react";
import DeliverableCard from "../../components/task.components.tsx/deliverable-card.component";
import type {
  Deliverable,
  DeliverableFile,
  FeedbackCriterion,
  Task,
  User,
} from "../../lib/types";
import { useParams } from "react-router";
import FeedbackModal from "../../components/feedback.components/feedback-criteria-modal.component";
import type { ModalState as FeedbackModalState } from "../../components/feedback.components/feedback-criteria-modal.component";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box } from "@mui/material";
import { useAuth } from "../../providers/auth.provider";
import TableLayout from "../../components/base.components/table-layout.component";
import type { ModalMode } from "../../components/project.components/project-modal.component";
import { preventContextMenu } from "@fullcalendar/core/internal";

export default function TaskRoute() {
  const { authState, authorizedAPI } = useAuth();
  const user = authState.user as User;

  const [feedbackModalState, setFeedbackModalState] = useState<FeedbackModalState>({
    mode: "create",
    open: false,
  });
  const [feedbackModalData, setFeedbackModalData] = useState<FeedbackCriterion>({
    feedbackCriterionID: 0,
    description: "",
    status: "unmet",
    changeObserved: "",
  });

  const { projectID, taskID } = useParams();

  /* ---------------------------------------------------------------------------------- */

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      method,
      url,
      data,
      timeout,
    }: {
      method: string;
      url: string;
      data: any;
      timeout?: number;
      invalidateQueryKeys: any[][];
    }) =>
      await authorizedAPI(url, {
        method: method,
        json: data,
        timeout: timeout ?? 1000 * 10,
      }),
    onSuccess: (_data, variables) =>
      variables.invalidateQueryKeys.forEach((key) =>
        queryClient.invalidateQueries({
          queryKey: key,
        }),
      ),
  });

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ["tasks", taskID],
    queryFn: async (): Promise<Task> =>
      await authorizedAPI
        .get(`api/users/${user.userID}/projects/${projectID}/tasks/${taskID}`)
        .json(),
    select: useCallback((data: any): Task => {
      return {
        ...data,
        assignedDate: new Date(data.assignedDate),
        dueDate: new Date(data.dueDate),
      };
    }, []),
    retry: 1,
  });

  const { data: submittedDeliverable, isLoading: submittedLoading } = useQuery({
    queryKey: [taskID, "deliverables", "submitted"],
    queryFn: async (): Promise<Deliverable | null> => {
      try {
        return await authorizedAPI
          .get(
            `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/submitted-deliverable`,
          )
          .json();
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    select: useCallback((data: any): Deliverable => {
      return { ...data, submissionTimestamp: new Date(data.submissionTimestamp) };
    }, []),
    retry: 1,
  });

  const { data: stagedDeliverable, isLoading: stagedLoading } = useQuery({
    queryKey: [taskID, "deliverables", "staged"],
    queryFn: async (): Promise<Deliverable | null> => {
      try {
        return await authorizedAPI
          .get(
            `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable`,
          )
          .json();
      } catch (error: any) {
        if (error.response?.status === 404 || error.status == 404) {
          return null;
        }
        throw error;
      }
    },
    select: useCallback((data: any): Deliverable | null => {
      if (!data) return null;
      return { ...data, submissionTimestamp: new Date(data.submissionTimestamp) };
    }, []),
    retry: 1,
    enabled: user.role != "supervisor",
  });

  /* ---------------------------------------------------------------------------------- */

  const handleCreateCriterionClick = () => {
    setFeedbackModalData({
      feedbackCriterionID: 0,
      description: "",
      status: "unmet",
      changeObserved: "",
    });
    setFeedbackModalState({ mode: "create", open: true });
  };

  const handleEditCriterionClick = (selectedCriterion: FeedbackCriterion) => {
    setFeedbackModalData(selectedCriterion);
    setFeedbackModalState({ mode: "edit", open: true });
  };

  const handleCancelClick = () => {
    setFeedbackModalState((prev) => ({ ...prev, open: false }));
  };

  /* ---------------------------------------------------------------------------------- */

  const handleCriterionDescriptionChange = (newDesc: string) => {
    setFeedbackModalData((prev) => ({ ...prev, description: newDesc }));
  };

  const handleCriterionStatusChange = (newStatus: FeedbackCriterion["status"]) => {
    setFeedbackModalData((prev) => ({ ...prev, status: newStatus }));
  };

  /* ---------------------------------------------------------------------------------- */

  const handleOpenStagedDeliverable = async () => {
    try {
      const response = await authorizedAPI.get(
        `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable?file=true`,
      );

      const contentDisposition = response.headers.get("content-disposition");
      const filename = (() => {
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^";]+)"/);
          if (match && match[1]) return match[1];
        }
        return "staged_deliverable.pdf";
      })();

      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      const fileURL = window.URL.createObjectURL(file);

      window.open(fileURL, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        window.URL.revokeObjectURL(fileURL);
      }, 1000 * 30);
    } catch (error) {
      console.error("Could not open staged deliverable:", error);
    }
  };

  const handleOpenSubmittedDeliverable = async () => {
    try {
      const response = await authorizedAPI.get(
        `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/submitted-deliverable?file=true`,
      );

      const contentDisposition = response.headers.get("content-disposition");
      const filename = (() => {
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^";]+)"/);
          if (match && match[1]) return match[1];
        }
        return "submitted_deliverable.pdf";
      })();

      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      const fileURL = window.URL.createObjectURL(file);

      window.open(fileURL, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        window.URL.revokeObjectURL(fileURL);
      }, 1000 * 30);
    } catch (error) {
      console.error("Could not open submitted deliverable:", error);
    }
  };

  /*
    file.arrayBuffer() returns the file contents as an ArrayBuffer, which is simply
    a fixed length binary data buffer that cannot be manipulated.

    Thus, by constructing a UInt8Array from the buffer, the contents can be manipulated,
    and in that case, converted to base64 format that can be processed by the server.
 */
  const handleFileUpload = async (file: File) => {
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const base64File = base64js.fromByteArray(fileBytes);

    const deliverableFile: DeliverableFile = {
      filename: file.name,
      file: base64File,
      contentType: file.type,
    };

    mutation.mutate({
      method: "post",
      url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable`,
      data: deliverableFile,
      invalidateQueryKeys: [[taskID, "deliverables", "staged"]],
    });
  };

  const handleSubmitDeliverable = () => {
    mutation.mutate({
      method: "post",
      url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable/submit`,
      data: {},
      invalidateQueryKeys: [
        [taskID, "deliverables", "staged"],
        [taskID, "deliverables", "submitted"],
      ],
    });
  };

  const handleRemoveStagedDeliverable = () => {
    mutation.mutate({
      method: "delete",
      url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable`,
      data: {},
      invalidateQueryKeys: [[taskID, "deliverables", "staged"]],
    });
  };

  const handleCreateCriterion = () => {
    mutation.mutate(
      {
        method: "post",
        url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/feedback`,
        data: feedbackModalData,
        invalidateQueryKeys: [["tasks", taskID]],
      },
      {
        onSettled: () => {
          setFeedbackModalState((prev) => ({ ...prev, open: false }));
        },
      },
    );
  };

  const handleEditCriterion = () => {
    mutation.mutate(
      {
        method: "put",
        url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/feedback/${feedbackModalData.feedbackCriterionID}`,
        data: feedbackModalData,
        invalidateQueryKeys: [["tasks", taskID]],
      },
      {
        onSettled: () => {
          setFeedbackModalState((prev) => ({ ...prev, open: false }));
        },
      },
    );
  };

  const handleOverrideCriterion = (
    criterion: FeedbackCriterion,
    action: "override" | "restore",
  ) => {
    mutation.mutate({
      method: "put",
      url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/feedback/${criterion.feedbackCriterionID}/override`,
      data: { ...criterion, status: action == "override" ? "overridden" : "unmet" },
      invalidateQueryKeys: [["tasks", taskID]],
    });
  };

  const handleDeleteCriterion = (criterion: FeedbackCriterion) => {
    mutation.mutate({
      method: "delete",
      url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/feedback/${criterion.feedbackCriterionID}`,
      data: {},
      invalidateQueryKeys: [["tasks", taskID]],
    });
  };

  const handleLockTask = () => {
    mutation.mutate({
      method: "put",
      url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}`,
      data: { ...task, dueDate: task?.dueDate.toISOString(), isLocked: !task?.isLocked },
      invalidateQueryKeys: [["tasks", taskID]],
    });
  };

  const handleCheckFeedbackCompliance = () => {
    mutation.mutate({
      method: "post",
      url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/feedback/compliance-check`,
      data: {},
      timeout: 1000 * 60,
      invalidateQueryKeys: [["tasks", taskID]],
    });
  };

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
        {/* Left Section - Task Details */}
        <TaskDetails sx={{ maxWidth: "63vw", flexGrow: 3 }}>
          <TaskDetails.Header
            title={task?.title ?? "Task Title"}
            dueDate={task?.dueDate ?? new Date()}
            isLocked={task?.isLocked ?? false}
          />

          <TaskDetails.Content>
            <TaskDetails.Description description={task?.description ?? ""} />
          </TaskDetails.Content>

          {((user.role == "student" && (task?.feedbackCriterias ?? []).length > 0) ||
            user.role == "supervisor") && (
            <TableLayout spacing={0}>
              <TableLayout.Toolbar title="Feedback Criteria">
                {user.role === "supervisor" && (
                  <TableLayout.AddButton
                    text="Add Criterion"
                    onClick={handleCreateCriterionClick}
                  />
                )}
              </TableLayout.Toolbar>

              <TableLayout.Content>
                <FeedbackCriteriaTable
                  criteria={
                    task?.feedbackCriterias?.sort(
                      (c1, c2) => c1.feedbackCriterionID - c2.feedbackCriterionID,
                    ) ?? []
                  }
                  role={user.role}
                  handleOverrideCriterion={handleOverrideCriterion}
                  handleEditCriterionClick={handleEditCriterionClick}
                  handleDeleteCriterion={handleDeleteCriterion}
                />
              </TableLayout.Content>
            </TableLayout>
          )}
        </TaskDetails>

        {/* Right Section - Task Actions */}
        <TaskActions
          sx={{
            width: "25vw",
            minWidth: "25vw",
            background: "hsla(0,0%,100%,50%)",
          }}>
          <TaskActions.Header title="Task Actions" />

          {submittedDeliverable && (
            <DeliverableCard
              cardDescription="Submitted Deliverable"
              deliverable={submittedDeliverable}
              onOpenDeliverable={handleOpenSubmittedDeliverable}
            />
          )}
          {!task?.isLocked && user.role != "supervisor" && stagedDeliverable ? (
            <DeliverableCard
              cardDescription="Staged Deliverable"
              deliverable={stagedDeliverable}
              onOpenDeliverable={handleOpenStagedDeliverable}
              onRemove={handleRemoveStagedDeliverable}
            />
          ) : (
            user.role == "student" && (
              <TaskActions.DeliverableUpload
                handleFileUpload={handleFileUpload}
                taskLocked={task?.isLocked ?? false}
              />
            )
          )}

          <TaskActions.Actions>
            {user.role == "supervisor" && (
              <TaskActions.LockTaskButton
                isLocked={task?.isLocked ?? false}
                onLockTaskClick={handleLockTask}
              />
            )}
            {user.role == "student" && (
              <TaskActions.CheckComplianceButton
                disabled={
                  !stagedDeliverable ||
                  task?.feedbackCriterias?.filter((c) => c.status == "unmet").length == 0
                }
                onClick={handleCheckFeedbackCompliance}
                isLoading={mutation.status == "pending"}
              />
            )}
            {user.role == "student" && (
              <TaskActions.SubmitDeliverableButton
                disabled={
                  task?.isLocked ||
                  !stagedDeliverable ||
                  task?.feedbackCriterias?.some((c) => c.status === "unmet")
                }
                onClick={handleSubmitDeliverable}
              />
            )}
          </TaskActions.Actions>
        </TaskActions>
      </Box>

      {/* Feedback Modal */}
      <FeedbackModal open={feedbackModalState.open}>
        <FeedbackModal.Header mode={feedbackModalState.mode} />

        {(feedbackModalState.mode == "create" || feedbackModalState.mode == "edit") && (
          <FeedbackModal.Fields>
            <FeedbackModal.Description
              description={feedbackModalData.description}
              handleDescriptionChange={handleCriterionDescriptionChange}
            />
            <FeedbackModal.Status
              status={feedbackModalData.status}
              handleStatusChange={handleCriterionStatusChange}
            />
            {feedbackModalState.mode == "edit" && (
              <FeedbackModal.ChangeObserved
                changeObserved={feedbackModalData.changeObserved ?? ""}
              />
            )}
          </FeedbackModal.Fields>
        )}

        <FeedbackModal.Actions
          mode={feedbackModalState.mode}
          loading={mutation.status === "pending"}
          disabled={mutation.isPending}
          handleCancelClick={handleCancelClick}
          handleCreate={handleCreateCriterion}
          handleEdit={handleEditCriterion}
        />
      </FeedbackModal>
    </>
  );
}
