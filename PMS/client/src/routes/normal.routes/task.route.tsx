import FeedbackCriteriaTable from "../../components/feedback.components/feedback-criteria-table.component";
import * as base64js from "base64-js";
import TaskActions from "../../components/task.components.tsx/task-actions.component";
import { TaskDetails } from "../../components/task.components.tsx/task-details.component";
import React, { useCallback, useEffect, useState } from "react";
import DeliverableCard from "../../components/task.components.tsx/deliverable-card.component";
import type {
  Deliverable,
  DeliverableFile,
  FeedbackCriterion,
  FeedbackCriterionModal,
  Task,
  User,
} from "../../lib/types";
import { useParams } from "react-router";
import FeedbackModal from "../../components/feedback.components/feedback-criteria-modal.component";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Box } from "@mui/material";
import { useAuth } from "../../providers/auth.provider";

export default function TaskRoute() {
  const { authState, authorizedAPI } = useAuth();
  const user = authState.user as User;

  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackComplianceLoading, setFeedbackComplianceLoading] =
    useState<boolean>(false);

  const [tableCriteria, setTableCriteria] = useState<FeedbackCriterion[]>([]);
  const [modalCriteria, setModalCriteria] = useState<FeedbackCriterionModal[]>([]);

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

  useEffect(() => {
    const criteria = task?.feedbackCriterias ?? [];
    setModalCriteria(
      criteria.map((c: FeedbackCriterion) => ({
        feedbackCriterionID: c.feedbackCriterionID,
        description: c.description,
        updateStatus: "unchanged",
      })),
    );
    setTableCriteria(criteria);
  }, [task]);

  /* ---------------------------------------------------------------------------------- */

  const handleOverrideToggle = (id: number) => {
    setTableCriteria((prev) =>
      prev.map((criterion) => {
        if (criterion.feedbackCriterionID !== id) return criterion;

        return {
          ...criterion,
          status: criterion.status === "unmet" ? "overridden" : "unmet",
        };
      }),
    );
  };

  const handleAddCriterion = () => {
    setModalCriteria((prev) => [
      ...prev,
      {
        feedbackCriterionID: (prev[prev.length - 1]?.feedbackCriterionID ?? 0) + 1,
        description: "",
        updateStatus: "created",
      },
    ]);
  };

  const handleCriterionDescriptionChange = (
    updatedCriterion: Partial<FeedbackCriterion>,
  ) => {
    setModalCriteria((prev) =>
      prev.map((c) =>
        c.feedbackCriterionID == updatedCriterion.feedbackCriterionID
          ? {
              ...c,
              description: updatedCriterion.description ?? "",
              updateStatus: c.updateStatus == "created" ? "created" : "updated",
            }
          : c,
      ),
    );
  };

  const handleCriterionDelete = (deletedCriterion: Partial<FeedbackCriterion>) => {
    setModalCriteria((prev) =>
      prev.map((c) =>
        c.feedbackCriterionID == deletedCriterion.feedbackCriterionID
          ? {
              ...c,
              updateStatus: "deleted",
            }
          : c,
      ),
    );
  };

  const handleCancelClick = () => {
    setFeedbackModalOpen(false);
  };
  const handleProvideFeedbackClick = () => {
    setFeedbackModalOpen(true);
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

  const handleSubmitFeedback = () => {
    const existingIDs = new Set(
      task?.feedbackCriterias?.map((f: FeedbackCriterion) => f.feedbackCriterionID),
    );

    const toCreate = modalCriteria
      .filter((c) => c.updateStatus === "created")
      .map((c) => ({
        description: c.description,
      }));

    const toUpdate = modalCriteria.filter((c) => c.updateStatus === "updated");

    const toDelete = modalCriteria
      .filter(
        (c) => c.updateStatus === "deleted" && existingIDs.has(c.feedbackCriterionID),
      )
      .map((c) => ({
        feedbackCriterionID: c.feedbackCriterionID,
      }));

    mutation.mutate(
      {
        method: "post",
        url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/feedback`,
        data: {
          feedbackCriteriaToCreate: toCreate,
          feedbackCriteriaToUpdate: toUpdate,
          feedbackCriteriaToDelete: toDelete,
        },
        invalidateQueryKeys: [["tasks", taskID]],
      },
      {
        onSettled: () => {
          setFeedbackModalOpen(false);
          setModalCriteria((prev) => prev.filter((c) => c.updateStatus != "deleted"));
        },
      },
    );
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
    if (!feedbackComplianceLoading) {
      setFeedbackComplianceLoading(true);
      mutation.mutate(
        {
          method: "post",
          url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/feedback/compliance-check`,
          data: {},
          timeout: 1000 * 60,
          invalidateQueryKeys: [["tasks", taskID]],
        },
        {
          onSuccess: () => setFeedbackComplianceLoading(false),
          onError: () => setFeedbackComplianceLoading(false),
        },
      );
    }
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
            <TaskDetails.Description>{task?.description}</TaskDetails.Description>
          </TaskDetails.Content>

          {tableCriteria.length > 0 && (
            <FeedbackCriteriaTable
              criteria={tableCriteria}
              overrideToggleEnabled={user.role === "student"}
              onOverrideToggle={handleOverrideToggle}
            />
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
          {!task?.isLocked && stagedDeliverable ? (
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
              <TaskActions.ProvideFeedbackButton
                disabled={!submittedDeliverable}
                hasPreviousCriteria={(task?.feedbackCriterias ?? [])?.length > 0}
                onClick={handleProvideFeedbackClick}
              />
            )}
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
                  tableCriteria.filter((c) => c.status == "unmet").length == 0
                }
                onClick={handleCheckFeedbackCompliance}
                isLoading={feedbackComplianceLoading}
              />
            )}
            {user.role == "student" && (
              <TaskActions.SubmitDeliverableButton
                disabled={
                  task?.isLocked ||
                  !stagedDeliverable ||
                  tableCriteria.some((c) => c.status === "unmet")
                }
                onClick={handleSubmitDeliverable}
              />
            )}
          </TaskActions.Actions>
        </TaskActions>
      </Box>

      {/* Feedback Modal */}
      <FeedbackModal open={feedbackModalOpen}>
        <FeedbackModal.Header />

        <FeedbackModal.Content>
          <FeedbackModal.CriteriaList
            criteria={modalCriteria}
            onCriterionDescriptionChange={handleCriterionDescriptionChange}
            onCriterionDelete={handleCriterionDelete}
          />
          <FeedbackModal.AddButton onAdd={handleAddCriterion} />
        </FeedbackModal.Content>

        <FeedbackModal.Actions
          hasPreviousCriteria={(task?.feedbackCriterias ?? [])?.length > 0}
          onCancel={handleCancelClick}
          onSubmit={handleSubmitFeedback}
        />
      </FeedbackModal>
    </>
  );
}
