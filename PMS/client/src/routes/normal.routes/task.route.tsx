
import FeedbackCriteriaTable from '../../components/task.components/feedback-criteria-table.component';
import TaskActions from '../../components/task.components/task-actions.component'
import { TaskDetails } from '../../components/task.components/task-details.component'
import { useState } from 'react';
import DeliverableCard from '../../components/task.components/deliverable-card.component';
import type { DeliverableFile, FeedbackCriteria, TaskDetailData } from '../../lib/types';

interface TaskDetailDataExtended extends TaskDetailData {
    submittedDeliverableFile: DeliverableFile | null;
    uploadedDeliverableFile: DeliverableFile | null;
}

const mockTaskData: TaskDetailDataExtended = {
    taskTitle: "Implement Server-Side Rendering for Auth Pages",
    taskDeadline: "2026-03-01",
    taskDescription: "The task requires implementing SSR for the user login and registration pages to improve SEO and initial load performance. All static assets must be cached efficiently. This description is long enough to push the deliverable file card down slightly, making the side-by-side layout effective.",
    // submittedDeliverableFile: null,
    uploadedDeliverableFile: null,
    feedbackCriteria: [
        { id: 1, text: "SSR is functional on local environment.", status: "met" },
        { id: 2, text: "Page load time is under 1.5 seconds.", status: "unmet" },
        { id: 3, text: "Caching layer correctly implemented.", status: "overridden" },
        { id: 4, text: "All unit tests pass.", status: "met" },
        { id: 5, text: "ll unit tests pass.", status: "met" },
        { id: 6, text: "All unit tests pass.", status: "met" },
    ],
    submittedDeliverableFile: {
        fileName: "auth-ssr-deliverable-v1.pdf",
        url: "#",
        uploadedAt: "2025-11-20",
        sizeLabel: "1.2 MB",
    },
    // uploadedDeliverableFile: {
    //   fileName: "auth-ssr-deliverable-v1.pdf",
    //   url: "#",
    //   uploadedAt: "2025-11-20",
    //   sizeLabel: "1.2 MB",
    // }
};

export default function TaskRoute() {
    const [taskData, setTaskData] = useState<TaskDetailDataExtended>(mockTaskData);

    const { taskTitle, taskDeadline, taskDescription, feedbackCriteria,
        submittedDeliverableFile, uploadedDeliverableFile } = taskData;

    const handleOverrideToggle = (id: number) => {
        setTaskData(prev => ({
            ...prev,
            feedbackCriteria: prev.feedbackCriteria.map((criterion: FeedbackCriteria) => {
                if (criterion.id !== id) return criterion;

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

    const handleProvideFeedbackClick = () => {

    }

    const handleCheckComplianceClick = () => {

    }

    const handleSubmitDeliverableClick = () => {

    }

    return (
        <>
            <TaskDetails sx={{
                flexGrow: 3,
                maxWidth: "65vw",
            }}>
                <TaskDetails.Header
                    title={taskTitle}
                    deadline={taskDeadline}>
                </TaskDetails.Header>

                <TaskDetails.Body>
                    <TaskDetails.Description> {taskDescription} </TaskDetails.Description >

                    {submittedDeliverableFile &&
                        <DeliverableCard
                            text="Submitted Deliverable"
                            sx={{
                                width: '18vw',
                            }}
                            deliverableFile={submittedDeliverableFile} />}
                </TaskDetails.Body>

                {feedbackCriteria.length > 0 && <FeedbackCriteriaTable
                    criteria={feedbackCriteria}
                    onOverrideToggle={handleOverrideToggle}
                />}
            </TaskDetails>

            <TaskActions sx={{
                flexGrow: 1,
                background: "hsla(0,0%,100%,50%)"
            }} >
                <TaskActions.Header title='Task Actions' />

                {uploadedDeliverableFile ?
                    <DeliverableCard
                        text="Uploaded Deliverable"
                        sx={{
                            width: "100%"
                        }}
                        deliverableFile={uploadedDeliverableFile} />
                    : <TaskActions.DeliverableUpload
                        handleFileUploadClick={handleFileUploadClick}
                    />}

                <TaskActions.ActionButtonContainer>
                    <TaskActions.ProvideFeedbackButton
                        disabled={!uploadedDeliverableFile}
                        handleProvideFeedbackClick={handleProvideFeedbackClick}
                    />
                    <TaskActions.CheckComplianceButton
                        disabled={!uploadedDeliverableFile}
                        handleCheckComplianceClick={handleCheckComplianceClick}
                    />
                    <TaskActions.SubmitDeliverableButton
                        disabled={!uploadedDeliverableFile ||
                            feedbackCriteria.some(c => c.status === "unmet")
                        }
                        handleSubmitDeliverableClick={handleSubmitDeliverableClick} />
                </TaskActions.ActionButtonContainer>
            </TaskActions>
        </>
    )
}