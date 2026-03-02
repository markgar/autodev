# AutoDev — User Journey Tests

Each journey exercises the application as a real user would, navigating through multiple features in sequence.

---

## J-1: App shell smoke test
<!-- after: 1 -->
<!-- covers: navigation, app.shell -->
<!-- tags: smoke -->
Open the app → verify "AutoDev" logo is visible in the sidebar → verify "Projects" section with "Dashboard" item and "Admin" section with "Sample Specs" item are present → click "Dashboard" and confirm the page loads without error → click "Sample Specs" and confirm the page loads without error → verify the active nav item is highlighted in each case.

---

## J-2: Dashboard empty state and first-project prompt
<!-- after: 4 -->
<!-- covers: dashboard, dashboard.empty-state, navigation -->
Navigate to the dashboard with no existing projects → verify the "No projects yet" empty state message is shown → verify a "Create your first project" button is visible → click the button and confirm navigation to `/projects/new` → return to the dashboard using the browser back button.

---

## J-3: New project form validation
<!-- after: 5 -->
<!-- covers: projects.create, projects.create.validation, forms -->
Navigate to `/projects/new` → click "Create Project" without filling in any fields → verify inline validation errors appear for both "Project Name" (required) and "Sample Spec" (required) → type a valid name, leave the spec unselected, and submit again → verify only the spec error remains → select a spec, clear the name field, and submit → verify only the name error appears.

---

## J-4: Create project end-to-end
<!-- after: 5 -->
<!-- covers: dashboard, projects.create, projects.api, sample-specs.api -->
Navigate to the dashboard → click "New Project" → fill in a project name → wait for the sample spec dropdown to load and select a spec → click "Create Project" → verify the button shows a spinner while submitting → confirm automatic navigation to the new project detail page at `/projects/:id` → navigate back to the dashboard → verify the new project appears in the list with its name and a creation timestamp.

---

## J-5: Log viewer streaming and controls
<!-- after: 6 -->
<!-- covers: projects.logs, projects.detail, projects.logs.polling -->
Navigate to an existing project detail page → verify the project name and created date are shown in the header → verify a "Back to Dashboard" link is present → observe the log viewer panel (dark terminal-style background) → verify a green pulsing dot indicates polling is active → click "Pause" → verify the dot turns grey and polling stops → click "Resume" → verify polling resumes and new log lines appear at the bottom → scroll up in the log viewer to confirm auto-scroll pauses → scroll back to the bottom and confirm auto-scroll resumes.

---

## J-6: Log viewer empty and error states
<!-- after: 6 -->
<!-- covers: projects.logs, projects.logs.empty-state, projects.logs.error-state -->
Navigate to a project whose blob container exists but contains no log files → verify the "No logs yet — logs will appear here when a build runs" empty state message is shown → simulate an API failure (or navigate to a project with a non-existent container) → verify the "Could not load logs" error message and a "Retry" button are shown → click "Retry" and confirm the log viewer attempts to reload.

---

## J-7: Admin sample specs list and view modal
<!-- after: 7 -->
<!-- covers: admin.sample-specs, admin.sample-specs.view, navigation -->
Click "Sample Specs" in the Admin sidebar section → verify the page heading "Sample Specs" and an "Upload" button are shown → verify the table shows columns: Filename, Size, Last Modified, Actions → click the eye icon on a spec row → verify a modal dialog opens with the spec filename as the title and raw markdown content in a monospace scrollable block → click "Download" and verify the file download is triggered → click "Close" and confirm the modal closes.

---

## J-8: Upload spec and verify it appears in the project form
<!-- after: 7 -->
<!-- covers: admin.sample-specs.upload, sample-specs.api, projects.create -->
Navigate to the Sample Specs admin page → click "Upload" → select a `.md` file using the file picker → verify a success toast notification appears for the uploaded file → verify the table refreshes and the new spec appears in the list with its filename, size, and last-modified date → navigate to `/projects/new` → open the sample spec dropdown → verify the newly uploaded spec appears as a selectable option.

---

## J-9: Delete spec with confirmation dialog
<!-- after: 7 -->
<!-- covers: admin.sample-specs.delete, admin.sample-specs -->
Navigate to the Sample Specs admin page → click the trash icon on a spec row → verify a confirmation dialog appears with the message "Delete <filename>? This cannot be undone." and "Cancel"/"Delete" buttons → click "Cancel" → verify the spec remains in the list → click the trash icon again → click "Delete" in the confirmation dialog → verify a success toast is shown → verify the spec is removed from the table.

---

## J-10: Dashboard loading and error states
<!-- after: 4 -->
<!-- covers: dashboard.loading-state, dashboard.error-state, dashboard -->
Navigate to the dashboard while the projects API is slow → verify a skeleton/shimmer placeholder is shown during loading → simulate an API failure → verify an error toast notification appears and an inline "Failed to load projects" message with a "Retry" button is displayed → click "Retry" and confirm the dashboard attempts to reload the project list.

---

## J-11: Mobile responsive navigation
<!-- after: 7 -->
<!-- covers: navigation.mobile, responsive, app.shell -->
Resize the browser to a mobile viewport (< 768 px) → verify the sidebar is hidden by default → verify a hamburger menu button appears in the top bar → click the hamburger button → verify the sidebar slides in as an overlay → click "Sample Specs" → verify navigation occurs and the sidebar closes automatically → reopen the sidebar → click outside it and verify it closes → verify the dashboard renders projects as stacked cards (not a table) on mobile.

---

## J-12: Full cross-feature journey — upload spec, create project, view logs
<!-- after: 7 -->
<!-- covers: admin.sample-specs, admin.sample-specs.upload, projects.create, projects.api, projects.logs, dashboard, navigation -->
Click "Sample Specs" in the sidebar → upload a new `.md` spec file → verify it appears in the spec list → click "Dashboard" in the sidebar → click "New Project" → enter a project name → select the newly uploaded spec from the dropdown → submit the form → confirm navigation to the new project detail page → verify the project name and created date are shown → observe the log viewer for auto-scrolling log output → click "Pause" to stop polling → navigate back to the dashboard using the "Back to Dashboard" link → confirm the project is listed at the top (sorted by newest first).
