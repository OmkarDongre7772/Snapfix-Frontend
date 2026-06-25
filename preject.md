# SnapFix Frontend Progress

Date reviewed: 2026-06-25

This frontend is a Vite + React single page app for the SnapFix backend. The backend reference says Releases 1 to 3 are complete: civic reporting, worker bidding/task assignment, and task completion with proof, verification, payments, wallet, and ratings.

## Current Backend Scope

The frontend should currently support these completed backend releases:

- Release 1: auth, user profile, citizen report creation, nearby reports, support/duplicate flow, and notifications.
- Release 2: worker profile and location, nearby worker reports, bids, admin bid approval/rejection, task auto-creation, and worker task start.
- Release 3: proof upload, citizen verification/rejection, worker retry, admin final approval/rejection/reassignment, payment release, worker wallet/payment history, and worker rating.

Release 4 and 5 are future scope: Kafka/event-driven refactor, AI validation/classification, real-time WebSocket notifications, priority scoring, gateway, observability, caching, CI/CD, Kubernetes, load tests, and analytics dashboard.

## Frontend Current Progress

Project structure is already in place:

- React 19, Vite 8, React Router, Axios, Tailwind CSS, Oxlint.
- Shared UI components exist: buttons, cards, modals, inputs, badges, spinner, empty states, navigation.
- Theme context exists with light/dark mode support.
- Auth context exists with login, register, logout, boot-time silent refresh, refresh-token rotation, and Axios 401 retry handling.
- API modules exist for auth, users, reports, workers, bids, tasks, notifications, and admin flows.
- Role-based pages are already scaffolded for citizen, worker, and admin.

Implemented route areas:

- Public: `/login`, `/register`, `/unauthorized`.
- Citizen: home, profile, create report, report list, report detail, notifications.
- Worker: home, setup, nearby reports, report detail/bid form, bid list, task list/detail, wallet.
- Admin: home, report list/detail, task list/detail, payments.

Release coverage looks strong for:

- Authentication and refresh-token flow.
- Citizen report creation using multipart form data.
- Nearby report browsing.
- Worker profile setup and worker nearby report discovery.
- Worker bid placement, bid listing, and withdrawal.
- Admin report list, report detail, bid approval/rejection.
- Worker task start, proof upload, retry, and wallet/payment history.
- Admin task review, final approval/rejection, reassignment, and payment release.
- Basic notification history and mark-read flow.

## Verification Results

Commands checked:

- `npx vite build --debug`: passed. Production build generated successfully.
- `npx oxlint --format unix`: passed with warnings only.

Current lint warnings are mostly cleanup items:

- Unused imports/variables in several pages.
- React fast-refresh warnings where context/constants are exported from component files.
- Missing hook dependencies in a few `useEffect` calls.

## Important Issues To Fix First

1. Route guard prop mismatch

`App.jsx` passes `allowedRoles`, but `RouteGuard.jsx` currently reads `role`. This means role restriction is likely not being enforced as intended. Fix either side so the prop names match.

2. Citizen Release 3 flow is incomplete/uncertain

`ReportDetail.jsx` tries to verify and rate using `report.taskId` and `report.workerId`, but the code comments show uncertainty about whether `ReportResponse` actually contains those fields. The frontend needs a reliable task lookup path for the citizen who owns the report.

Suggested backend/frontend contract options:

- Add `taskId`, `workerId`, and proof summary fields to `ReportResponse` when a report has an assigned task.
- Or add a citizen endpoint like `GET /reports/{reportId}/task`.
- Or add a citizen task list/detail endpoint if citizens should manage verifications from a task view.

3. Proof viewing for citizens needs completion

The citizen should be able to see the worker's proof image, remarks, submitted location, and submitted time before verifying or rejecting. The current code declares proof state but does not use it.

4. Several files contain mojibake characters

Some emoji/comment text appears as garbled arrow, emoji, dash, and currency characters in several JSX files. This does not block the build, but it hurts polish and readability. Replace these with plain text, proper UTF-8 symbols, or icon components.

5. Lint cleanup should happen before adding more screens

Clean unused imports/variables, hook dependency warnings, and fast-refresh warnings. This will make future regressions easier to catch.

## Suggested Next Steps

### Phase 1 - Stabilize Existing Frontend

- Fix `RouteGuard` role prop mismatch.
- Remove unused `ComingSoon` component or wire it intentionally.
- Clean unused imports and unused variables reported by Oxlint.
- Fix hook dependency warnings in auth/task detail pages.
- Replace garbled visible strings and comments.
- Confirm `.env` points to the running backend: `VITE_API_BASE_URL=http://localhost:8080`.

### Phase 2 - Finish Release 1 User Flow

- Test register, login, refresh, logout, and protected-route behavior for all three roles.
- Validate citizen report creation with real image upload and location.
- Improve citizen report list so it clearly shows the user's own reports, not just nearby reports, if the backend supports a "my reports" endpoint.
- Add friendly error states for report creation, support conflicts, and location denial.
- Make notifications refresh after mark-read and show unread counts consistently.

### Phase 3 - Finish Release 2 Marketplace Flow

- Verify worker setup creates profile and wallet correctly.
- Confirm worker nearby reports uses server-stored worker location.
- Add duplicate-bid handling UI for 409 responses.
- In admin report detail, make bid approval/rejection states clear after action.
- Ensure worker task list updates after admin approves a bid.

### Phase 4 - Finish Release 3 Completion Flow

- Decide and implement the citizen task/proof data contract.
- Show proof image, worker remarks, submitted location, and submitted date to citizens.
- Allow citizens to submit rejection comments.
- After citizen verification, show the correct pending-admin state.
- After admin final approval, show completed state and rating form to the citizen.
- Prevent duplicate rating submission or show existing rating if already rated.
- In admin task detail, confirm payment release only appears for valid `COMPLETED` tasks.
- In worker wallet, show payment status, amount, task reference, and release date cleanly.

### Phase 5 - Polish And Reliability

- Add consistent loading, empty, and error states across every list/detail page.
- Add client-side validation matching backend DTOs: password rules, report description length, valid coordinates, bid amount, duration, rating score.
- Add mobile navigation improvements if the current top nav gets cramped.
- Add smoke tests or at least a manual test checklist for the main flows.
- Consider React Query later for caching/loading consistency, especially before Release 4/5.

## Manual End-to-End Test Checklist

Use this once the backend is running:

1. Citizen registers and creates a report with image and GPS.
2. Worker registers, completes worker setup, updates location, sees nearby report.
3. Worker places a bid.
4. Admin sees report bids and approves one bid.
5. Worker sees assigned task and starts it.
6. Worker uploads proof with image, location, and remarks.
7. Citizen opens the report/task, reviews proof, and verifies or rejects.
8. If rejected, worker retries and submits proof again.
9. Admin approves verified task.
10. Admin releases payment.
11. Worker wallet balance and payment history update.
12. Citizen rates the worker.

## Recommended Completion Order

1. Fix route guard and lint warnings.
2. Confirm API response shapes against backend DTOs.
3. Complete citizen proof verification and rating.
4. Run the full Release 1 to 3 manual workflow.
5. Polish UI states and mobile behavior.
6. Only then begin Release 4 frontend work such as real-time notifications, AI labels, priority display, and richer admin dashboards.
