# REST API Testing Suite

A Django REST Framework Task Manager API with a complete Postman test collection, Newman CLI runner, and test case documentation.

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Django + Django REST Framework** | REST API framework |
| **djangorestframework-simplejwt** | JWT authentication with access + refresh tokens |
| **SQLite** | Database (via Django ORM) |
| **Postman** | API test authoring and manual/visual test running |
| **Newman** | CLI test execution for automation/CI |

## Project Structure

```
REST API Testing Suite/
├── backend/ # Django API
│ ├── manage.py
│ ├── requirements.txt
│ ├── taskmanager/ # Project settings
│ └── api/ # Task Manager app
├── Task-Manager-API.postman_collection.json
├── staging.postman_environment.json
├── test-cases.md
├── package.json
└── reports/ # Newman HTML reports (generated)
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | No | User registration |
| POST | `/api/login` | No | Returns JWT access + refresh tokens |
| POST | `/api/refresh` | No | Returns new access token from refresh token |
| GET | `/api/tasks` | Yes | List current user's tasks |
| POST | `/api/tasks` | Yes | Create a task |
| GET | `/api/tasks/{id}` | Yes | Get single task |
| PUT | `/api/tasks/{id}` | Yes | Update task (owner only) |
| DELETE | `/api/tasks/{id}` | Yes | Delete task (owner only) |

## Setup

### 1. Backend (Django)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000`.

### 2. Postman

Import these files into Postman:
- `Task-Manager-API.postman_collection.json`
- `staging.postman_environment.json`

Run the collection manually or use Collection Runner for the **Chained Flow** folder.

### 3. Newman (CLI)

```bash
npm install
npm run test:api
```

Report is generated at `./reports/api-report.html`.

## Testing Highlights

- **JWT refresh flow**: valid refresh, invalid token, missing token — covers "token expires mid-session"
- **Auth edge cases**: duplicate email, missing fields, wrong password, non-existent user
- **Authorization test**: User B cannot retrieve, update, or delete User A's task — all three verified to return `404`
- **Schema validation**: JSON Schema assertions on all task responses
- **Chained flow**: Register → Login → Refresh → Create → Update → Delete in one Runner execution
- **Response time**: All requests assert < 500ms

## Security Verification

To confirm the authorization test was a genuine safeguard and not a false positive, the owner-scoped `get_queryset()` filter was temporarily removed from `TaskDetailView`, allowing User B to successfully modify User A's task (`200 OK` instead of the expected `404`). Restoring the filter brought the correct `404` response back. This was then verified manually across all three affected actions — GET, PUT, and DELETE — each independently confirmed to return `404` for a non-owner. This confirms the test suite would actually catch a real **IDOR (Insecure Direct Object Reference)** vulnerability if one were introduced, rather than passing by coincidence.

See [test-cases.md](./test-cases.md) for the full test strategy matrix.