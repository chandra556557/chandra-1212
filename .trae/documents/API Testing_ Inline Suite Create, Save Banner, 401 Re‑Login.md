## Overview
Implement three UX improvements in API Testing test case management: inline "Create Suite" so the suite selector is never empty, an after‑save banner with a quick "Run now" link, and graceful 401 handling with an inline re‑login prompt.

## Frontend Changes (ApiTesting.tsx)
- Replace the numeric `Suite ID` input with a suites dropdown backed by `/api/api-testing/suites`.
- Add an inline "➕ Create Suite" control inside the Test Case card.
- Auto‑show the inline suite form when there are no suites so the selector is never empty.
- After test case creation, show a banner: `Saved test case to suite X` and a link to run it immediately.
- Handle 401 consistently by showing an inline re‑login prompt inside the card and retrying the original action on success.

## Data & State
- `suites`, `suiteLoading`, `selectedSuiteId` to populate and drive the dropdown (`ctSuiteId` stays as the bound value).
- Inline suite form state: `newSuiteName`, `newSuiteBaseUrl`, `newSuiteHeaders` (JSON), optional `newSuiteDescription`.
- Banner state: `saveBanner` with `{visible, suiteName, testCaseId}`.
- Auth prompt state: `authRequired` with `{visible, lastAction}` to retry the failed action post‑login.

## API Integration
- Load suites: `GET /api/api-testing/suites` with `Authorization: Bearer <accessToken>`.
- Create suite: `POST /api/api-testing/suites` with `{name, description?, baseUrl?, headers?, authConfig?}`; on success, append to `suites` and set `ctSuiteId`.
- Create test case: existing `POST /api/api-testing/test-cases` flow; capture returned `id` & suite name for banner.
- Run test case: `POST /api/api-testing/test-cases/:id/execute`; display result in the existing results area.

## 401 Handling (Inline Re‑Login)
- Introduce an `apiFetch` helper that attaches `Authorization` from localStorage and detects `401`.
- On `401`, set `authRequired.visible = true` and stash the `lastAction` function closure to retry.
- Inline login form posts to `/api/auth/login` with `{email, password}`; store `accessToken` + `refreshToken` in `localStorage`, hide prompt, then invoke `lastAction()`.
- Apply to all backend calls in this component: load suites, create suite, create test case, execute test case, generate test data.

## UI/UX Details
- Suites dropdown shows names; if empty, the inline form is open by default, and the save button creates the first suite and auto‑selects it.
- The banner is dismissible; link triggers execute and switches focus to the Execution Result card.
- JSON inputs (headers) are parsed with try/catch; invalid JSON shows a small inline error badge.

## Files Impacted
- `frontend/src/components/ApiTesting.tsx` only; no backend changes required.

## Verification
- Start app with a user not logged in; attempt load suites → inline re‑login appears; login succeeds and suites load.
- Create a suite from the Test Case card and confirm it appears in the dropdown and is selected.
- Create a test case → banner appears with correct suite name; click "Run now" → execution result displays.
- Force a 401 (clear token) on create/execute → inline re‑login prompts and, on success, retries action.

## Rollback & Safety
- Changes are contained; revertable by restoring the original `ApiTesting.tsx`.
- Tokens are never logged; headers parsing guarded; network errors surfaced with friendly messages.