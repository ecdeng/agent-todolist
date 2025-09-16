# Prompt for AI Agent Task Scheduler Project

You are an expert full-stack software architect and senior developer. I have a project idea, and I need you to help me design the architecture and create a detailed, step-by-step development plan. Your output should be comprehensive, well-structured, and provide clear guidance for implementation.

## Project Title: AI Agent Task Scheduler

### Project Overview

I want to build a simple web application that functions like a "todo list" but is specifically designed for creating, managing, and scheduling tasks for AI agents. Each "task" or "ticket" in the list is essentially a configurable API request to an OpenAI model. The application should allow me to define the request details, schedule it for a future time, and then automatically send the request. Once the OpenAI API responds, the result should be captured and displayed within the corresponding task ticket.

### Core Feature Requirements

1.  **Task Management (CRUD):**
    * **Create:** A user should be able to create a new task. The creation form must include fields for:
        * A short, descriptive `Title`.
        * A more detailed `Description` of the goal.
        * The target `OpenAI Model` (e.g., a dropdown for `gpt-4o`, `gpt-4-turbo`, etc.).
        * The `Prompt` or request payload to be sent to the API.
        * A `Schedule Time` (a date and time picker) for when the request should be executed.
    * **Read:** Display a list of all created tasks on a main dashboard. Each item in the list should show its title, status, and scheduled time. Clicking on a task should show its full details.
    * **Update:** A user should be able to edit all the details of a task, but only *before* it has been executed.
    * **Delete:** A user should be able to delete a task.

2.  **Task Status Tracking:**
    * Each task must have a clear status that updates automatically. The statuses should be:
        * `Pending`: The task has been created but is not yet scheduled for execution.
        * `Scheduled`: The task is queued and waiting for its execution time.
        * `In-Progress`: The API request has been sent to OpenAI and we are awaiting a response.
        * `Completed`: We have successfully received a response from OpenAI.
        * `Error`: The API call failed for some reason (e.g., invalid API key, server error).

3.  **Scheduling Engine:**
    * This is the core of the application. There must be a reliable backend mechanism that checks for scheduled tasks and executes them at the correct time.
    * This should work even if the user has closed their browser.

4.  **OpenAI Integration:**
    * The backend must securely connect to the OpenAI API using an API key.
    * It should construct the API request based on the data stored in the task ticket.
    * It must handle both successful responses and potential errors from the API.

5.  **Response Handling:**
    * When a task is `Completed`, the full JSON response from the OpenAI API should be saved.
    * The response should be neatly displayed in the task's detail view. If there was an `Error`, the error message should be displayed instead.

### My Request to You

Please provide the following:

**1. Recommended Technology Stack:**
   * Suggest a modern, practical technology stack.
   * **Frontend:** Recommend a framework (e.g., React, Vue, Svelte) and key libraries for UI components and state management.
   * **Backend:** Recommend a language and framework (e.g., Node.js with Express, Python with FastAPI, etc.).
   * **Database:** Recommend a database type (e.g., PostgreSQL, MongoDB) and justify your choice.
   * **Scheduling Mechanism:** Propose a specific technology or pattern for the scheduling engine (e.g., a cron job, a library like `node-cron`, or a message queue system like BullMQ with Redis).

**2. Detailed Architecture Plan:**
   * **Frontend Architecture:** Describe the key components you would build (e.g., `TaskList`, `TaskItem`, `TaskDetailView`, `CreateEditForm`).
   * **Backend Architecture:**
      * Define the necessary API endpoints (e.g., `POST /api/tasks`, `GET /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`).
      * Describe the service-layer logic for handling a task's lifecycle.
   * **Database Schema:** Provide a clear schema for the main `tasks` table, including column names, data types, and brief descriptions (e.g., `id`, `title`, `prompt`, `status`, `scheduled_at`, `response_payload`, etc.).
   * **Scheduler Design:** Explain in detail how the scheduling component would work. How does it pick up jobs? How does it interact with the database and the OpenAI service?

**3. Step-by-Step Development Plan:**
   * Break down the project into logical, sequential phases. This should be a clear roadmap from project setup to a functional application.
   * Example phases might include:
      1.  **Phase 1: Project Setup & Backend Foundation:** (Setup project structure, initialize backend, design DB schema, create basic CRUD API endpoints without logic).
      2.  **Phase 2: Basic Frontend:** (Build UI components to list, create, and view tasks, connecting them to the backend API).
      3.  **Phase 3: Core Scheduling Logic:** (Implement the background worker/cron job to process tasks).
      4.  **Phase 4: OpenAI Integration:** (Write the service to securely call the OpenAI API and handle the response).
      5.  **Phase 5: Finalizing the Loop:** (Connect the scheduler to the OpenAI service, save responses to the DB, and display them on the frontend).
      6.  **Phase 6: Polishing:** (Add error handling, loading states, and UI improvements).

Please provide a detailed and well-organized response that I can use as a blueprint for building this application. Be explicit with your recommendations and justify your architectural decisions.