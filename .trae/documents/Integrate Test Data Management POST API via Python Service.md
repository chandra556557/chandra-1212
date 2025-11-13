## Overview
- Add a backend proxy endpoint that forwards requests to `http://34.46.36.105:3000/genieapi/assisstant/generte-test-data`.
- Keep Python service hidden from the frontend; React calls the Node backend only.
- Use env-driven configuration for base URL, timeout and optional auth.

## Backend Changes
- Create/extend route in `playwright-crx-enhanced/backend/src/routes/python-api.routes.ts`:
  - Add `POST /api/testdata/generate` that forwards the incoming JSON body unchanged to the Python API path `/assisstant/generte-test-data` using a dedicated Axios client.
  - Configure Axios with `PYTHON_API_URL` (default `http://34.46.36.105:3000/genieapi`) and `PYTHON_API_TIMEOUT`.
  - Optional: include `PYTHON_API_TOKEN` to add `Authorization: Bearer <token>` header if needed.
  - Map Python API responses directly; on errors, respond with status, message and original error body.
- Register the route in `playwright-crx-enhanced/backend/src/index.ts` under `/api/testdata` so it is rate-limited and documented. Current router mounts are in `playwright-crx-enhanced/backend/src/index.ts:140-151`.
- Add basic validation (e.g., presence of body) and a `traceId` in responses for easier debugging.

## Frontend Changes
- Add a small UI action to call the new backend endpoint:
  - Either extend `frontend/src/components/ApiTesting.tsx` or add `TestDataManagement.tsx` with a form (`prompt`, optional `schema`, `count`).
  - Use Axios to `POST /api/testdata/generate` and render the returned JSON.
  - Show loading, success and error states.

## Configuration
- Add the following env vars to backend:
  - `PYTHON_API_URL=http://34.46.36.105:3000/genieapi`
  - `PYTHON_API_TIMEOUT=30000`
  - Optional: `PYTHON_API_TOKEN=<token-if-required>`
- Keep CORS as-is (frontend talks to Node; Node talks to Python).

## Error Handling & Security
- Do not expose the Python URL to the frontend; proxy through backend only.
- Log method, path, and status; avoid logging sensitive payloads.
- Return meaningful HTTP codes: 400 for invalid input, 504 for timeouts, 502 for upstream errors.
- Respect existing rate limiting on `/api/*` and helmet/cors setup.

## Testing & Verification
- Backend integration test with Supertest: posts sample payload to `/api/testdata/generate` and asserts passthrough behavior and error mapping.
- Manual verification with curl:
  - `curl -X POST http://localhost:3001/api/testdata/generate -H "Content-Type: application/json" -d '{"prompt":"Create users","count":3}'`
- Frontend manual test: form submission displays generated JSON.

## Deliverables
- Backend route implementation with Axios proxy and env configuration.
- Frontend UI action to trigger and display results.
- Tests and example curl commands.

## Assumptions
- Python endpoint accepts JSON and returns JSON.
- No authentication is required; if needed, we’ll add token header via `PYTHON_API_TOKEN`.

Please confirm and I’ll implement these changes end-to-end.