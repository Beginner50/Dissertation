/* 
  FR8/FR12/FR13/FR14/FR15/FR16
  G. Supervisors shall be able to provide feedback on the latest task submission. To maintain integrity,
     the system shall provide a function to lock the task, preventing further submissions. The system shall
     display supervisor feedback criteria for the latest deliverable submission in a structured tabular format.
    G.1. Feedback Criterion 
      G.1.1. Unsuccessful Feedback Criterion Creation (Feature Not Available for Task without a submission)
      G.1.2. Successful Feedback Criterion Creation 
      G.1.3. Successful Feedback Criterion Update
      G.1.4. Successful Feedback Criterion Delete

    G.2. Lock/Unlock Task
      G.2.1. Successful Task Lock & Unlock 
    
  H. The system shall provide a staging area for students to upload and delete deliverable files prior
     to final submission. The system shall block deliverable re-submission until all feedback criteria
     are marked as "Met" by the AI or "Overridden" by the student or when a “locked” task is unlocked
     by the supervisor.
    H.1. Deliverable in staging area
      H.1.1. Successful Deliverable Upload
      H.1.2. Unsuccessful Deliverable Upload (Invalid File Format)
      H.1.3. Successful Deliverable Deletion
    
    H.2. Deliverable Submission
      H.2.1. Unsuccessful Deliverable Submission (No Deliverable in staging area)
      H.2.2. Unsuccessful Deliverable Submission (Containes Unmet Feedback Criterion)
      H.2.3. Unsuccessful Deliverable Submission (Task is Locked)
      H.2.4. Successful Deliverable Submission
    
  I. The system shall utilize a multi-modal LLM to evaluate deliverable re-submissions against prior
     feedback criteria, while tracking pertinent changes for each.
    I.1. AI Feedback Criteria Analysis + Change Summarizer
      I.1.1. Successful Feedback Criteria Overriden 
*/
