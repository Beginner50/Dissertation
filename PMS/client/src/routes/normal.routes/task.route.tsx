import FeedbackCriteriaTable from "../../components/feedback.components/feedback-criteria-table.component";
import * as base64js from "base64-js";
import TaskActions from "../../components/task.components.tsx/task-actions.component";
import { TaskDetails } from "../../components/task.components.tsx/task-details.component";
import { useEffect, useState } from "react";
import DeliverableCard from "../../components/task.components.tsx/deliverable-card.component";
import type { DeliverableFile, FeedbackCriteria } from "../../lib/types";
import { user, origin } from "../../lib/temp";
import { useParams } from "react-router";
import { useSingleTaskQuery } from "../../lib/hooks/useTasksQuery";
import {
  useStagedDeliverableQuery,
  useSubmittedDeliverableQuery,
} from "../../lib/hooks/useDeliverablesQuery";
import { useDeliverableMutation } from "../../lib/hooks/useDeliverableMutation";
import FeedbackModal from "../../components/feedback.components/feedback-criteria-modal.component";

export default function TaskRoute() {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackComplianceLoading, setFeedbackComplianceLoading] =
    useState<boolean>(false);

  const [tableCriteria, setTableCriteria] = useState<FeedbackCriteria[]>([]);
  const [modalCriteria, setModalCriteria] = useState<FeedbackCriteria[]>([]);

  const { projectID, taskID } = useParams();

  const deliverableMutation = useDeliverableMutation();

  const { data: task, isLoading: taskLoading } = useSingleTaskQuery({
    projectID,
    taskID,
  });
  const { data: submittedDeliverable, isLoading: submittedLoading } =
    useSubmittedDeliverableQuery({
      projectID,
      taskID,
    });
  const { data: stagedDeliverable, isLoading: stagedLoading } =
    useStagedDeliverableQuery({
      projectID,
      taskID,
      disabled: user.role != "student",
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
    setModalCriteria((prev) => [
      ...prev,
      { feedbackCriteriaID: 0, description: "", status: "unmet" },
    ]);
  };
  const handleCancelClick = () => {
    setFeedbackModalOpen(false);
  };
  const handleProvideFeedbackClick = () => {
    setFeedbackModalOpen(true);
  };

  /* ---------------------------------------------------------------------------------- */

  const handleFileUpload = async (file: File) => {
    /*
        file.arrayBuffer() returns the file contents as an ArrayBuffer, which is simply
        a fixed length binary data buffer that cannot be manipulated.

        Thus, by constructing a UInt8Array from the buffer, the contents can be manipulated,
        and in that case, converted to base64 format that can be processed by the server.
    */
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const base64File = base64js.fromByteArray(fileBytes);

    const deliverableFile: DeliverableFile = {
      filename: file.name,
      file: base64File,
      contentType: file.type,
    };

    deliverableMutation.mutate({
      method: "post",
      url: `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable`,
      data: deliverableFile,
    });
  };

  const handleSubmitDeliverable = () => {
    deliverableMutation.mutate({
      method: "post",
      url: `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable/submit`,
      data: {},
    });
  };

  const handleRemoveStagedDeliverable = () => {
    deliverableMutation.mutate({
      method: "delete",
      url: `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable`,
      data: {},
    });
  };

  const handleSubmitFeedback = () => {
    const filteredCriteria = modalCriteria.filter(
      (c) => c.description.trim() !== ""
    );

    deliverableMutation.mutate(
      {
        method: "post",
        url: `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/feedback`,
        data: filteredCriteria,
      },
      {
        onSuccess: () => setFeedbackModalOpen(false),
      }
    );
  };

  const handleCheckFeedbackCompliance = () => {
    if (!feedbackComplianceLoading) {
      setFeedbackComplianceLoading(true);
      deliverableMutation.mutate(
        {
          method: "post",
          url: `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/feedback/compliance-check`,
          data: {},
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
      <TaskDetails
        sx={{
          flexGrow: 3,
          display: "flex",
          flexDirection: "column",
          maxWidth: "65vw",
          maxHeight: "78vh",
          overflowY: "scroll",
        }}
      >
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
            onOverrideToggle={handleOverrideToggle}
          />
        )}
      </TaskDetails>

      <TaskActions
        sx={{
          flexGrow: 1,
          maxWidth: "25vw",
          background: "hsla(0,0%,100%,50%)",
        }}
      >
        <TaskActions.Header title="Task Actions" />
        {submittedDeliverable && (
          <DeliverableCard
            cardDescription="Submitted Deliverable"
            url={`${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/submitted-deliverable?file=true`}
            deliverable={submittedDeliverable}
          />
        )}
        {stagedDeliverable ? (
          <DeliverableCard
            cardDescription="Staged Deliverable"
            url={`${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable?file=true`}
            deliverable={stagedDeliverable}
            onRemove={handleRemoveStagedDeliverable}
          />
        ) : (
          user.role == "student" && (
            <TaskActions.DeliverableUpload
              handleFileUpload={handleFileUpload}
            />
          )
        )}

        <TaskActions.ActionButtonContainer>
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
                !stagedDeliverable ||
                tableCriteria.some((c) => c.status === "unmet")
              }
              onClick={handleSubmitDeliverable}
            />
          )}
        </TaskActions.ActionButtonContainer>
      </TaskActions>

      <FeedbackModal open={feedbackModalOpen}>
        <FeedbackModal.Header />
        <FeedbackModal.Content>
          <FeedbackModal.CriteriaList
            criteria={modalCriteria}
            onUpdateCriteria={setModalCriteria}
          />
          <FeedbackModal.AddButton onAdd={handleAddCriterion} />
        </FeedbackModal.Content>
        <FeedbackModal.Actions
          onCancel={handleCancelClick}
          onSubmit={handleSubmitFeedback}
          disabled={modalCriteria.every((c) => c.description.trim() === "")}
        />
      </FeedbackModal>
    </>
  );
}
