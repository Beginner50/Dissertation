import FeedbackCriteriaTable from "../../components/task.components/feedback-criteria-table.component";
import TaskActions from "../../components/task.components/task-actions.component";
import { TaskDetails } from "../../components/task.components/task-details.component";
import { useEffect, useState } from "react";
import DeliverableCard from "../../components/task.components/deliverable-card.component";
import type {
  Deliverable,
  DeliverableFile,
  FeedbackCriteria,
  Task,
} from "../../lib/types";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { user, origin } from "../../lib/temp";
import { useParams } from "react-router";
import { TryOutlined } from "@mui/icons-material";

export default function TaskRoute() {
  const [tempFeedbackCriteria, setTempFeedbackCriteria] = useState<
    FeedbackCriteria[]
  >([]);
  const { projectID, taskID } = useParams();

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ["tasks", taskID],
    queryFn: async () =>
      (await ky
        .get(
          `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}`
        )
        .json()) as Task,
  });

  const { data: submittedDeliverable, isLoading: submittedLoading } = useQuery({
    queryKey: ["submitted-deliverable"],
    queryFn: async () => {
      try {
        const response = await ky.get(
          `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/submitted-deliverable`
        );
        const submittedDeliverable = (await response.json()) as Deliverable;
        return submittedDeliverable;
      } catch {
        return null;
      }
    },
    retry: 1,
  });

  useEffect(() => {
    setTempFeedbackCriteria(submittedDeliverable?.feedbackCriterias ?? []);
  }, [submittedDeliverable]);

  const { data: stagedDeliverable, isLoading: stagedLoading } = useQuery({
    queryKey: ["unsubmitted-deliverable"],
    queryFn: async () => {
      try {
        const response = await ky.get(
          `${origin}/api/users/${user.userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable`
        );
        const stagedDeliverable = (await response.json()) as Deliverable;
        return stagedDeliverable;
      } catch (e) {
        return null;
      }
    },
    enabled: user.role === "student",
    retry: 1,
  });

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

  const handleFileUploadClick = () => {
    console.log("Triggering file upload dialog...");
  };

  const handleProvideFeedbackClick = () => {};

  const handleCheckComplianceClick = () => {};

  const handleSubmitDeliverableClick = () => {};

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
          <TaskActions.DeliverableUpload
            handleFileUploadClick={handleFileUploadClick}
          />
        )}

        <TaskActions.ActionButtonContainer>
          <TaskActions.ProvideFeedbackButton
            disabled={!submittedDeliverable}
            handleProvideFeedbackClick={handleProvideFeedbackClick}
          />
          <TaskActions.CheckComplianceButton
            disabled={!stagedDeliverable || tempFeedbackCriteria.length == 0}
            handleCheckComplianceClick={handleCheckComplianceClick}
          />
          <TaskActions.SubmitDeliverableButton
            disabled={
              !stagedDeliverable ||
              tempFeedbackCriteria.some((c) => c.status === "unmet")
            }
            handleSubmitDeliverableClick={handleSubmitDeliverableClick}
          />
        </TaskActions.ActionButtonContainer>
      </TaskActions>
    </>
  );
}
