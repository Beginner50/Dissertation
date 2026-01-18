import FeedbackCriteriaTable from "../../components/feedback.components/feedback-criteria-table.component";
import * as base64js from "base64-js";
import TaskActions from "../../components/task.components.tsx/task-actions.component";
import { TaskDetails } from "../../components/task.components.tsx/task-details.component";
import { useEffect, useState } from "react";
import DeliverableCard from "../../components/task.components.tsx/deliverable-card.component";
import type {
  Deliverable,
  DeliverableFile,
  FeedbackCriteria,
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

  const [tableCriteria, setTableCriteria] = useState<FeedbackCriteria[]>([]);
  const [modalCriteria, setModalCriteria] = useState<Partial<FeedbackCriteria>[]>([]);

  const { projectID, taskID } = useParams();

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

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ["tasks", taskID],
    queryFn: async (): Promise<Task> =>
      await authorizedAPI
        .get(`api/users/${user.userID}/projects/${projectID}/tasks/${taskID}`)
        .json(),
    retry: 1,
  });

  const { data: submittedDeliverable, isLoading: submittedLoading } = useQuery({
    queryKey: [taskID, "deliverables", "submitted"],
    queryFn: async (): Promise<Deliverable | null> => {
      try {
        return await authorizedAPI
          .get(
            `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/submitted-deliverable`
          )
          .json();
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: 1,
  });

  const { data: stagedDeliverable, isLoading: stagedLoading } = useQuery({
    queryKey: [taskID, "deliverables", "staged"],
    queryFn: async (): Promise<Deliverable | null> => {
      try {
        return await authorizedAPI
          .get(
            `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable`
          )
          .json();
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: 1,
    enabled: user.role != "supervisor",
  });

  useEffect(() => {
    const criteria = submittedDeliverable?.feedbackCriterias ?? [];
    setTableCriteria(criteria);
    setModalCriteria(criteria);
  }, [submittedDeliverable]);

  /* ---------------------------------------------------------------------------------- */

  const handleOverrideToggle = (id: number) => {
    setTableCriteria((prev) =>
      prev.map((criterion) => {
        if (criterion.feedbackCriteriaID !== id) return criterion;

        return {
          ...criterion,
          status: criterion.status === "unmet" ? "overridden" : "unmet",
        };
      })
    );
  };

  const handleAddCriterion = () => {
    setModalCriteria((prev) => [...prev, { description: "", status: "unmet" }]);
  };

  const handleCriterionDescriptionChange = (
    updatedCriteria: Partial<FeedbackCriteria>
  ) => {
    const newModalCriteria = [
      ...modalCriteria.filter(
        (c) => c.feedbackCriteriaID != updatedCriteria.feedbackCriteriaID
      ),
      updatedCriteria,
    ];
    setModalCriteria(newModalCriteria);
  };

  const handleCriterionDelete = (criterionToDelete: Partial<FeedbackCriteria>) => {
    setModalCriteria(
      modalCriteria.filter(
        (criteria) => criteria.feedbackCriteriaID != criterionToDelete.feedbackCriteriaID
      )
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
      const blob = await authorizedAPI
        .get(
          `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable?file=true`
        )
        .blob();

      const fileUrl = window.URL.createObjectURL(blob);
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Could not open staged deliverable:", error);
    }
  };

  const handleOpenSubmittedDeliverable = async () => {
    try {
      const blob = await authorizedAPI
        .get(
          `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/submitted-deliverable?file=true`
        )
        .blob();

      const fileUrl = window.URL.createObjectURL(blob);
      window.open(fileUrl, "_blank", "noopener,noreferrer");
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
    const filteredCriteria = modalCriteria.filter((c) => c?.description?.trim() !== "");

    mutation.mutate(
      {
        method: "post",
        url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/feedback`,
        data: filteredCriteria,
        invalidateQueryKeys: [[taskID, "deliverables", "submitted"]],
      },
      {
        onSuccess: () => setFeedbackModalOpen(false),
      }
    );
  };

  const handleCheckFeedbackCompliance = () => {
    if (!feedbackComplianceLoading) {
      setFeedbackComplianceLoading(true);
      mutation.mutate(
        {
          method: "post",
          url: `api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/feedback/compliance-check`,
          data: {},
          invalidateQueryKeys: [[taskID, "deliverables", "submitted"]],
        },
        {
          onSuccess: () => setFeedbackComplianceLoading(false),
          onError: () => setFeedbackComplianceLoading(false),
        }
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
            deadline={task?.dueDate ?? "Due Date"}
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
            flexGrow: 1,
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
          {stagedDeliverable ? (
            <DeliverableCard
              cardDescription="Staged Deliverable"
              deliverable={stagedDeliverable}
              onOpenDeliverable={handleOpenStagedDeliverable}
              onRemove={handleRemoveStagedDeliverable}
            />
          ) : (
            user.role == "student" && (
              <TaskActions.DeliverableUpload handleFileUpload={handleFileUpload} />
            )
          )}

          <TaskActions.Actions>
            {user.role == "supervisor" && (
              <TaskActions.ProvideFeedbackButton
                disabled={!submittedDeliverable}
                onClick={handleProvideFeedbackClick}
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
                  !stagedDeliverable || tableCriteria.some((c) => c.status === "unmet")
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
          onCancel={handleCancelClick}
          onSubmit={handleSubmitFeedback}
        />
      </FeedbackModal>
    </>
  );
}
