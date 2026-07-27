# Playwright E-Commerce Automation Framework

A maintainable, production-style test automation framework for [Sauce Demo](https://www.saucedemo.com) built with Playwright, TypeScript, and Allure reporting. Designed for team extensibility — not just a collection of tests, but a proper architectural foundation.

## Framework Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Test Specs (tests/)                      │
│   login.spec.ts │ inventory.spec.ts │ cart.spec.ts │ checkout  │
└────────────────────────────┬────────────────────────────────────┘
                             │ uses
┌────────────────────────────▼────────────────────────────────────┐
│                    Page Object Model (pages/)                      │
│   LoginPage → InventoryPage → CartPage → CheckoutPage            │
│                         ▲ extends                                │
│                      BasePage                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │ uses
┌────────────────────────────▼────────────────────────────────────┐
│              Utilities & Fixtures (utils/ │ fixtures/)            │
│   custom-assertions │ test-data-generator │ users.json             │
│                                         checkout-data.json         │
└─────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              Playwright Config + Reporting                         │
│   Cross-browser (Chromium/Firefox/WebKit) │ Allure │ HTML         │
│   Trace on failure │ Screenshots │ Video                           │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Playwright** | Browser automation with auto-waiting and trace viewer |
| **TypeScript** | Type-safe page objects and test data |
| **Allure Report** | Professional reporting with history and failure categorization |
| **Sauce Demo** | Stable target app with built-in edge cases for negative testing |

## Project Structure

```
ecommerce-automation/
├── tests/
│   ├── login.spec.ts          # Login positive & negative scenarios
│   ├── inventory.spec.ts      # Sort, add/remove, badge count
│   ├── cart.spec.ts           # Cart operations & persistence
│   └── checkout.spec.ts       # Data-driven checkout validation
├── pages/
│   ├── BasePage.ts            # Shared navigation & wait helpers
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── fixtures/
│   ├── users.json             # Test user credentials
│   └── checkout-data.json     # Data-driven checkout scenarios
├── utils/
│   ├── test-data-generator.ts # Dynamic test data utilities
│   └── custom-assertions.ts   # Reusable assertion helpers
├── playwright.config.ts
├── package.json
└── README.md
```

## Design Patterns

### Page Object Model (POM)
Every page class extends `BasePage` and encapsulates locators and actions. Tests never touch raw selectors — they call page methods. When the UI changes, you update one file, not twenty tests.

### Data-Driven Testing
Checkout scenarios are driven by `fixtures/checkout-data.json`. The spec loops over each entry, separating test logic from test data. Adding a new scenario means adding a JSON row, not duplicating test code.

### Fixtures for Data Separation
User credentials live in `fixtures/users.json`, not hardcoded in specs. Credentials rotate or expand without touching test files.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
cd ecommerce-automation
npm install
npx playwright install
```

### Run Tests

```bash
# All tests, all browsers
npx playwright test

# Single browser
npx playwright test --project=chromium

# Cross-browser (explicit)
npx playwright test --project=chromium --project=firefox --project=webkit

# Specific spec file
npx playwright test tests/login.spec.ts

# Headed mode (watch tests run)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

### View Reports

**Playwright HTML Report:**
```bash
npx playwright show-report
```

**Allure Report:**
```bash
npx allure generate ./allure-results --clean
npx allure open
```

**Trace Viewer** (on failure):
```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

## Test Coverage

### Login (`login.spec.ts`)
| Test | Type |
|------|------|
| Valid login → inventory page | Positive |
| Locked-out user → lockout error | Negative |
| Empty username → required error | Negative |
| Empty password → required error | Negative |
| Wrong password → auth error | Negative |

### Inventory (`inventory.spec.ts`)
| Test | Type |
|------|------|
| Products display on load | Positive |
| Sort by name A-Z / Z-A | Positive |
| Sort by price low-high / high-low | Positive |
| Add-to-cart badge count updates | Positive |
| Add then remove item | Positive |
| Cart badge persists across navigation | Positive |

### Cart (`cart.spec.ts`)
| Test | Type |
|------|------|
| Empty cart verification | Positive |
| Add items and verify contents | Positive |
| Remove item from cart | Positive |
| Continue shopping navigation | Positive |
| Cart persists after logout/re-login | Positive |
| Proceed to checkout navigation | Positive |

### Checkout (`checkout.spec.ts`)
| Test | Type |
|------|------|
| Valid checkout → order complete | Positive (data-driven) |
| Missing first name → error | Negative (data-driven) |
| Missing last name → error | Negative (data-driven) |
| Missing postal code → error | Negative |
| Cancel checkout → returns to cart | Positive |
| Empty cart after item removal | Negative |

## Quality Standards

- **Stable locators**: Uses `data-test` attributes where available on Sauce Demo
- **No hardcoded waits**: Only explicit state-based waits (`waitFor`, `expect.toBeVisible`)
- **Test independence**: Each test sets up its own state via `beforeEach` — no test depends on another
- **Negative testing**: At least 3 genuine edge/negative cases per major flow
- **Failure artifacts**: Screenshots, video, and Playwright trace retained on failure for debugging

## npm Scripts

```bash
npm test                  # Run all tests
npm run test:chromium     # Chromium only
npm run test:cross        # All three browsers
npm run test:headed       # Headed mode
npm run report            # Open Playwright HTML report
npm run allure:generate   # Generate Allure report
npm run allure:open       # Open Allure report
```
