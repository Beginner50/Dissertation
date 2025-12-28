import FeedbackCriteriaTable from "../../components/task.components/feedback-criteria-table.component";
import * as base64js from "base64-js";
import TaskActions from "../../components/task.components/task-actions.component";
import { TaskDetails } from "../../components/task.components/task-details.component";
import { useEffect, useState } from "react";
import DeliverableCard from "../../components/task.components/deliverable-card.component";
import type { DeliverableFile, FeedbackCriteria } from "../../lib/types";
import { user, origin } from "../../lib/temp";
import { useParams } from "react-router";
import { useSingleTaskQuery } from "../../lib/hooks/useTasksQuery";
import {
  useStagedDeliverableQuery,
  useSubmittedDeliverableQuery,
} from "../../lib/hooks/useDeliverablesQuery";
import { useDeliverableMutation } from "../../lib/hooks/useDeliverableMutation";

export default function TaskRoute() {
  const [tempFeedbackCriteria, setTempFeedbackCriteria] = useState<
    FeedbackCriteria[]
  >([]);
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
    setTempFeedbackCriteria(submittedDeliverable?.feedbackCriterias ?? []);
  }, [submittedDeliverable]);

  /* ---------------------------------------------------------------------------------- */

  const handleOverrideToggle = (id: number) => {
    setTempFeedbackCriteria((prev) => ({
      ...prev,
      feedbackCriteria: prev.map((criterion: FeedbackCriteria) => {
        if (criterion.feedbackCriteriaID !== id) return criterion;

        if (criterion.status === "unmet") {
          return { ...criterion, status: "overridden" };
        }

        if (criterion.status === "overridden") {
          return { ...criterion, status: "unmet" };
        }

        return criterion;
      }),
    }));
  };

  const handleProvideFeedbackClick = () => {};

  const handleCheckComplianceClick = () => {};

  const handleSubmitDeliverableClick = () => {};

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

        {tempFeedbackCriteria.length > 0 && (
          <FeedbackCriteriaTable
            criteria={tempFeedbackCriteria}
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
              handleProvideFeedbackClick={handleProvideFeedbackClick}
            />
          )}
          {user.role == "student" && (
            <TaskActions.CheckComplianceButton
              disabled={!stagedDeliverable || tempFeedbackCriteria.length == 0}
              handleCheckComplianceClick={handleCheckComplianceClick}
            />
          )}
          {user.role == "student" && (
            <TaskActions.SubmitDeliverableButton
              disabled={
                !stagedDeliverable ||
                tempFeedbackCriteria.some((c) => c.status === "unmet")
              }
              handleSubmitDeliverableClick={handleSubmitDeliverableClick}
            />
          )}
        </TaskActions.ActionButtonContainer>
      </TaskActions>
    </>
  );
}
