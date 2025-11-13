## Guiding Principles
- Task-focused workflows: optimize for create → validate → persist → run → observe.
- Consistency: shared patterns for forms, lists, filters, status, and errors across views.
- Safety: mask sensitive values by default, clear auth/session behavior.
- Observability: surface traceId, result summaries, and clear banners.
- Performance: paginate/virtualize large grids, avoid heavy DOM.

## Core Navigation
- Main views: Dashboard, Scripts, Runs, Test Data, API Testing, Reports (Allure), Analytics, Settings.
- Quick actions: prominent buttons to jump into Test Data and API Testing.
- Suite-aware UX: show current suite context as a persistent badge in Test Data and API Testing.

## Test Data (UI)
- Suite chips list with active selection.
- Grid of test data with filters: environment, type, search.
- Actions per record: duplicate, edit, delete, copy code snippet (optional), mask/unmask sensitive fields.
- Generate modal: parameters (suite selection/new, dataType, count, environment, sample JSON) and a success banner with created count and suite name.
- Backend refresh after mutations (no stale local state).
- Pagination/virtualization for large datasets; server-side `limit/offset` and sort.

## API Testing (UI)
- Request builder: method, URL (supports `{{var}}`), headers, body (json/text/form).
- Response panel: status, headers count, pretty JSON, error messages.
- Assertions panel: add/edit/remove (`exists`, `equals`, `contains`, `status`) and evaluated pass/fail.
- Test Case Management: select suite, name test case, save current request + assertions, list saved test cases with Run.
- Scenario composer: chain steps with variable captures; show last status/duration.
- OpenAPI validation: paste spec, validate last response, summarize pass/fail and errors.
- Environments: list/edit variables; use `{{var}}` substitution in URL/headers/body.
- History: recent requests with method, URL, status, duration.

## AI Integration (Python)
- Ask Python AI button: calls Python-backed suggestion endpoint; show source label and `traceId`.
- Display suggestions with rationale; one-click add to assertions.
- Handle upstream error with clear message; retry control.

## Observability & Feedback
- Success banners: “Saved X records to suite Y”, “Test case created”, “Run completed: status Z, duration N ms”.
- Errors: inline error blocks and toast; include brief guidance.
- TraceId: display when available; copy-to-clipboard.

## Security & Governance
- Mask secrets and PII by default (toggle per field); never render tokens in plain text.
- Respect auth: global interceptor adds `Authorization`; 401 triggers re-login.
- Ownership-aware lists (only user’s suites/data/test cases).
- Audit-friendly: show createdAt/updatedAt and user attribution where helpful.

## Performance & Robustness
- Client-side caching with TTL for heavy lists; invalidate on mutations.
- Paginate Test Data grid; debounce search.
- Defensive parsing for JSON inputs; live validation hints.

## Configuration & Extensibility
- Config panel in Settings to toggle Python endpoints usage.
- `API_BASE`/env var variables visible in UI Environments.
- Optional feature flags: OpenAPI panel, Scenario composer.

## Rollout Plan
1. Test Data UX polish: success banners, auto-select suite after generate, pagination.
2. API Testing: finalize Test Case Management list/run UI and robust error banners.
3. AI Suggestions: show `traceId`, graceful fallbacks, retry.
4. Observability: add a unified toast system and inline banners across views.
5. Settings: add a simple config panel to switch between server-side vs Python-backed endpoints.
6. Accessibility audit and UI cleanup (labeling, focus states, keyboard shortcuts).

## Success Criteria
- Users can generate, persist, and view Test Data with clear feedback.
- Users can author assertions, save test cases, and run them from the UI.
- Python-backed suggestions are available with source and traceId shown.
- Performance remains responsive on large datasets; pagination is smooth.
- Errors and auth states are predictable and easy to recover from.