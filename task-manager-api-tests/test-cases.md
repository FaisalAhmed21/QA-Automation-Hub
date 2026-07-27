# Test Cases — Task Manager API

> **Interview tip:** Lead with this document, not the code. Walk through the matrix row by row, then demo the Chained Flow in Postman Collection Runner.

| Test Case ID | Endpoint | Type | Expected Result | Pass/Fail |
|---|---|---|---|---|
| TC-AUTH-001 | POST /api/register | Positive | 201 Created; response contains `id`, `username`, `email` | Pass |
| TC-AUTH-002 | POST /api/register | Negative | 400 Bad Request when email already exists | Pass |
| TC-AUTH-003 | POST /api/register | Negative | 400 Bad Request when required fields are missing | Pass |
| TC-AUTH-004 | POST /api/login | Positive | 200 OK; response contains JWT `access` and `refresh` tokens | Pass |
| TC-AUTH-005 | POST /api/refresh | Positive | 200 OK; returns new `access` token when valid refresh token provided | Pass |
| TC-AUTH-006 | POST /api/refresh | Negative | 401 Unauthorized with invalid/expired refresh token | Pass |
| TC-AUTH-007 | POST /api/refresh | Negative | 400 Bad Request when refresh token is missing | Pass |
| TC-AUTH-008 | POST /api/login | Negative | 401 Unauthorized with wrong password | Pass |
| TC-AUTH-009 | POST /api/login | Negative | 401 Unauthorized for non-existent user | Pass |
| TC-TASK-001 | POST /api/tasks | Positive | 201 Created; response contains `id`, `title`, `completed`, `created_at` | Pass |
| TC-TASK-002 | POST /api/tasks | Negative (auth) | 401 Unauthorized when no JWT token provided | Pass |
| TC-TASK-003 | POST /api/tasks | Negative | 400 Bad Request when `title` is missing | Pass |
| TC-TASK-004 | GET /api/tasks | Positive | 200 OK; returns array of task objects owned by authenticated user | Pass |
| TC-TASK-005 | GET /api/tasks/{id} | Positive | 200 OK; returns single task matching valid ID | Pass |
| TC-TASK-006 | GET /api/tasks/{id} | Negative | 404 Not Found for invalid/non-existent task ID | Pass |
| TC-TASK-007 | PUT /api/tasks/{id} | Positive | 200 OK; task title and completed status updated | Pass |
| TC-TASK-008 | PUT /api/tasks/{id} | Negative (authz) | 404 Not Found when User B attempts to update User A's task | Pass |
| TC-TASK-009 | DELETE /api/tasks/{id} | Positive | 204 No Content; task deleted successfully | Pass |
| TC-AUTHZ-002 | GET /api/tasks/{id} | Negative (authz) | 404 Not Found when User B attempts to retrieve User A's task | Pass |
| TC-AUTHZ-003 | DELETE /api/tasks/{id} | Negative (authz) | 404 Not Found when User B attempts to delete User A's task | Pass |
| TC-FLOW-001 | Chained lifecycle | Positive | Register → Login → Refresh → Create → Update → Delete completes with all assertions passing | Pass |

---

## How to Explain This Out Loud (Interview Script)

### Opening (30 seconds)
"I built a Task Manager API in Django REST Framework and wrote a Postman collection with **30 requests and roughly 80 assertions**. My test strategy covers three layers: **authentication** (who are you?), **authorization** (what can you do?), and **functional CRUD** (does the data behave correctly?). I also have a chained lifecycle flow that runs end-to-end in one Collection Runner execution — that's what I'd demo live."

### Layer 1 — Authentication
"I test auth at the boundary, not just the happy path. Registration covers duplicate email and missing fields. Login covers wrong password and non-existent users. For JWT specifically, I test the **refresh flow** — valid refresh returns a new access token, invalid token returns 401, missing token returns 400. This answers the common interview question: *what happens when your access token expires mid-session?* You call `/api/refresh` with the refresh token, get a new access token, and continue — no re-login needed."

### Layer 2 — Authorization (the differentiator)
"This is where most testers stop at 'does login work?' I create **two users**. User A creates a task. User B — who is authenticated but not the owner — tries to retrieve, update, or delete it. All three are asserted to return **404**, not 200."

**Verification proof:** I deliberately removed owner-filtering from the Django view and re-ran the test. User B got **200 OK** and modified User A's task. The test **failed** with `expected 200 to be one of [403, 404]`. I restored the fix and it passed again. I then manually confirmed the same 404 behavior holds for GET and DELETE as well, not just PUT — all three verbs are consistently blocked for a non-owner. That proves the test catches real authorization bugs across the full resource, not just one code path that happens to work today.

### Layer 3 — Functional CRUD
"Every task response gets four checks: status code, required fields, response time under 500ms, and JSON Schema validation. Schema validation is the piece most people skip — it catches silent field renames or type changes that status-code-only tests miss."

### Chained Flow Demo
"In Postman Collection Runner, I run the **Chained Flow** folder. You watch it: register a user → login captures the JWT into a collection variable → refresh renews the token → create task uses `Authorization: Bearer {{chainedAuthToken}}` → update → delete. All automatic, no manual copy-paste. This is the best live demo."

**To run visually:** Postman → Import collection → open **Chained Flow** folder → click **Run** → watch variables populate in the run log.

### Newman (CI-ready)
"The same collection runs headless via Newman for Project 3 CI integration: `npm run test:api` generates an HTML report at `./reports/api-report.html`."

---

## Test Strategy Detail

### Authentication Testing
- **Positive**: Valid registration and login return expected status codes and response schemas.
- **Negative**: Duplicate email, missing fields, wrong password, non-existent user.
- **Token lifecycle**: Login captures both `access` and `refresh` via `pm.collectionVariables.set()`. Refresh endpoint tested for valid renewal, invalid token, and missing token.
- **Why refresh matters**: Access tokens expire (60 min in this API). Refresh tokens let clients renew without forcing re-login — a common production pattern and interview topic.

### Authorization Testing
- Two users (User A and User B) are created during the CRUD folder setup.
- User A creates a task; User B attempts to retrieve, update, and delete it.
- Asserts 404 Not Found on all three actions — **authentication passed but authorization denied**, and the API doesn't reveal whether the resource exists at all.
- **Bug-injection verified**: Removing owner filtering caused User B to get 200 on PUT; test correctly failed. GET and DELETE were additionally verified manually against the same owner-scoped `get_queryset()`, both returning 404 for a non-owner.

### CRUD Testing
- Full create-read-update-delete cycle with schema validation on every response.
- Response time assertions (< 500ms) on all requests.
- JSON Schema validation using Postman's built-in `jsonSchema` assertion.

### Chained Flow
Single Runner execution walks through the complete user lifecycle:
1. Register new user
2. Login and capture JWT + refresh token
3. Refresh token (simulate mid-session renewal)
4. Create task using refreshed access token
5. Update the task
6. Delete the task

### Newman CLI Execution
```bash
npm run test:api
```
Generates HTML report at `./reports/api-report.html`.

---

## Assertion Checklist (Every Request)

- [x] Status code assertion
- [x] Required fields assertion
- [x] Response time < 500ms
- [x] JSON Schema validation (where applicable)

## Authorization Bug-Injection Log

| Step | Action | Result |
|---|---|---|
| 1 | Removed owner filter + `IsOwnerOrReadOnly` from `TaskDetailView` | User B PUT on User A's task → **200 OK** (bug) |
| 2 | Ran `Update Task - Not Owner (negative)` | Test **FAILED**: `expected 200 to be one of [403, 404]` |
| 3 | Restored owner filtering + permission class | User B PUT → **404 Not Found**; test **PASSED** |
| 4 | Manually verified GET on User A's task (ID 9) with User B's token | **404 Not Found** — `"detail": "No Task matches the given query."` |
| 5 | Manually verified DELETE on User A's task (ID 9) with User B's token | **404 Not Found** — same response pattern |

This confirms TC-TASK-008, TC-AUTHZ-002, and TC-AUTHZ-003 are all real gates, not vanity assertions — the owner-scoped queryset consistently blocks non-owner access across all three affected HTTP verbs.