# QA Automation Hub

A monorepo combining a full UI test automation framework and a REST API test suite, wired into a shared CI/CD pipeline via GitHub Actions.

![UI Tests](https://github.com/FaisalAhmed21/QA-Automation-Hub/actions/workflows/ui-tests.yml/badge.svg)
![API Tests](https://github.com/FaisalAhmed21/QA-Automation-Hub/actions/workflows/api-tests.yml/badge.svg)

## What This Is

This repo brings together two independent test projects and runs both automatically on every push, pull request, and nightly schedule the same way a real QA/delivery pipeline would gate code changes before they reach production.

| Project | What it tests | Stack |
|---|---|---|
| [`ecommerce-automation/`](./ecommerce-automation) | UI regression testing for an e-commerce flow (login, inventory, cart, checkout) | Playwright, TypeScript, Page Object Model |
| [`task-manager-api-tests/`](./task-manager-api-tests) | REST API testing for a self-built Django backend, including authentication and authorization | Django REST Framework, JWT, Postman, Newman |

Each subproject has its own detailed README covering architecture, design patterns, and test coverage — this file covers how they fit together and how the CI pipeline runs.

## CI/CD Pipeline

Two independent GitHub Actions workflows run on every `push` and `pull_request` to `main`:

### `ui-tests.yml`
- Runs the Playwright suite across a browser matrix: **Chromium, Firefox, WebKit**
- Also runs nightly on a schedule (2 AM UTC) as a regression safety net
- Uploads the Playwright HTML report and Allure results as build artifacts, even on failure, for post-run debugging

### `api-tests.yml`
- Spins up the Django backend directly on the CI runner
- Waits for the server to be ready using a retry loop (not a fixed sleep) before running tests
- Runs the full Postman collection headlessly via Newman
- Uploads the Newman HTML report as a build artifact, even on failure

Both pipelines are designed so a broken build produces evidence (reports, traces) automatically, not just a X with no context.

## Why a Monorepo

Keeping both projects together, with CI wired across both, mirrors how many real QA/SDET roles work day to day: maintaining multiple test suites (UI and API) against the same product surface, with a single pipeline enforcing both on every change. It also makes the CI/CD design itself a demonstrable piece of work, not just an implementation detail, the workflows are reviewable here in one place, alongside what they test.

## Running Locally

Each project can be run independently, see their individual READMEs for full setup instructions:
- [`ecommerce-automation/README.md`](./ecommerce-automation/README.md)
- [`task-manager-api-tests/README.md`](./task-manager-api-tests/README.md)

## Repository Structure

```
qa-automation-hub/
├── .github/
│   └── workflows/
│       ├── ui-tests.yml
│       └── api-tests.yml
├── ecommerce-automation/        # Playwright UI test framework
└── task-manager-api-tests/      # Django API + Postman/Newman test suite
```
