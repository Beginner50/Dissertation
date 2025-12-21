export let user = {
    userID: 1,
    name: "John Doe",
    role: "student",
    projects: [{ projectID: 1, title: "Sample Project" }]
}

export const origin = window.location.origin.replace(/3000/, '5081');