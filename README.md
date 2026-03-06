# Square Payments API – TypeScript Proof-of-Concept

A focused TypeScript project that shows how to connect to and use the [Square Payments API](https://developer.squareup.com/docs/payments-api/overview).  
Everything runs against the **free Square Sandbox** – no real money, no production account required.

---

## Table of Contents

1. [What this project demonstrates](#what-this-project-demonstrates)
2. [Prerequisites](#prerequisites)
3. [Setting up a Square Developer Account & Sandbox](#setting-up-a-square-developer-account--sandbox)
4. [Project setup](#project-setup)
5. [Running the demos](#running-the-demos)
6. [Running the tests](#running-the-tests)
7. [Project structure](#project-structure)
8. [Key concepts](#key-concepts)
9. [Next steps](#next-steps)

---

## What this project demonstrates

| Module | What it shows |
|---|---|
| `src/client.ts` | Configuring a `SquareClient` from environment variables (sandbox vs production) |
| `src/locations.ts` | Listing and retrieving seller locations |
| `src/payments.ts` | Creating, retrieving, listing, and canceling payments |
| `src/customers.ts` | Creating, retrieving, listing, and deleting customer records |
| `src/refunds.ts` | Issuing full or partial refunds against completed payments |
| `src/demos/` | Runnable CLI scripts for each API area |

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18 or later (20+ recommended) |
| npm | 9 or later |

---

## Setting up a Square Developer Account & Sandbox

Square provides a completely free **Sandbox** environment.  
No payment method, no real money, and no approval process required.

### Step 1 – Create a Square Developer account

1. Go to <https://developer.squareup.com> and click **Get started**.
2. Sign in with an existing Square account, or create a free account.
   - If you don't have a Square account, choose **Sign up** and fill in the form. You do **not** need to enter credit card information to create a developer account.

### Step 2 – Create an application in the Developer Dashboard

1. After signing in, you will be taken to the [Developer Dashboard](https://developer.squareup.com/apps).
2. Click **+ New Application**.
3. Give your application a name (e.g. "square-poc") and click **Save**.

Square automatically provisions a **Sandbox environment** alongside every application.

### Step 3 – Get your Sandbox Access Token

1. Click on your new application to open its settings.
2. At the top of the page, make sure the toggle reads **Sandbox** (not Production).
3. In the left sidebar, click **Credentials**.
4. Under the **Sandbox** section you will see a **Sandbox Access Token**.  
   Click **Show** and then copy the token – it looks like `EAAAlxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`.

> **Keep this token safe.**  
> It provides full read/write access to your sandbox data.  
> Never commit it to source control. (`.env` is already in `.gitignore`.)

### Step 4 (optional) – Create additional Sandbox Test Accounts

Your default sandbox already has one test seller. To simulate multiple sellers or specific
scenarios:

1. In the Developer Dashboard, click **Sandbox Test Accounts** in the left sidebar.
2. Click **+ New sandbox test account** and follow the prompts.

---

## Project setup

```bash
# 1. Clone the repository
git clone https://github.com/teragoatz/square-poc.git
cd square-poc

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

Open `.env` and replace `your_sandbox_access_token_here` with the token you copied in Step 3 above:

```dotenv
SQUARE_ACCESS_TOKEN=EAAAlxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SQUARE_ENVIRONMENT=sandbox
```

---

## Running the demos

Each demo is a standalone CLI script that talks to your sandbox.  
All use the magic source ID **`cnon:card-nonce-ok`** for payments – no card number needed.

### List your sandbox locations

This is the easiest first check that your access token is working.

```bash
npm run demo:locations
```

Expected output (your location ID will differ):

```
=== Square Locations Demo (SANDBOX) ===

Found 1 location(s):

  ID:      LPXXXXXXXXXXXXXXXXXX
  Name:    Default Test Account
  Status:  ACTIVE
  Country: US
  Currency:USD
```

### Create, retrieve, and cancel a payment

```bash
npm run demo:payments
```

This will:
1. Find your default sandbox location
2. Create a `$12.34` payment using the sandbox magic nonce
3. Retrieve the payment back to confirm it was stored
4. Cancel the payment (moves it to `CANCELED` status)
5. List the 5 most recent payments

### Create and delete a customer

```bash
npm run demo:customers
```

Creates a test customer, retrieves them by ID, lists all customers, then cleans up.

### Issue a refund

Refunds require a **COMPLETED** payment ID. Run the payments demo first and note
the payment ID from its output (it looks like `XkXXXXXXXXXXXXXXXXXXXXXXX`).

```bash
# Pass the payment ID as a CLI argument
npm run demo:refunds -- XkXXXXXXXXXXXXXXXXXXXXXXX

# Or set it in .env:  SQUARE_PAYMENT_ID=XkXXXXXXXXXXXXXXXXXXXXXXX
# then:
npm run demo:refunds
```

---

## Running the tests

The test suite uses **Jest** with **ts-jest** and fully mocks all Square API calls –
no network access or real credentials required.

```bash
npm test
```

Expected output:

```
Test Suites: 5 passed, 5 total
Tests:       31 passed, 31 total
```

---

## Project structure

```
square-poc/
├── .env.example          # Environment variable template (copy to .env)
├── jest.config.js        # Jest configuration
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Re-exports all public helpers
│   ├── client.ts         # SquareClient factory (reads env vars)
│   ├── payments.ts       # createPayment / getPayment / listPayments / cancelPayment
│   ├── locations.ts      # listLocations / getLocation / getDefaultLocation
│   ├── customers.ts      # createCustomer / getCustomer / listCustomers / deleteCustomer
│   ├── refunds.ts        # refundPayment / listRefunds
│   └── demos/
│       ├── payments-demo.ts
│       ├── locations-demo.ts
│       ├── customers-demo.ts
│       └── refunds-demo.ts
└── tests/
    ├── client.test.ts
    ├── payments.test.ts
    ├── locations.test.ts
    ├── customers.test.ts
    └── refunds.test.ts
```

---

## Key concepts

### Sandbox magic nonces

The Square sandbox accepts special **nonce** strings that simulate different card outcomes
without a real card number.  Use these as the `sourceId` when calling `payments.create`.

| Nonce | Behavior |
|---|---|
| `cnon:card-nonce-ok` | Payment succeeds |
| `cnon:card-nonce-declined` | Payment is declined |
| `cnon:card-nonce-avs-fail` | AVS check failure |
| `cnon:card-nonce-cvv-fail` | CVV check failure |
| `cnon:card-nonce-postal-fail` | Postal code check failure |

Full list: <https://developer.squareup.com/docs/devtools/sandbox/payments>

### Idempotency keys

Every mutating request (create payment, create customer, refund) requires an
[idempotency key](https://developer.squareup.com/docs/build-basics/using-idempotency) –
a unique string that allows Square to safely retry requests without creating duplicates.
This project uses `crypto.randomUUID()` (Node.js built-in) to generate them.

### Money amounts

Square represents all monetary amounts as **integers in the smallest currency unit**
(cents for USD, pence for GBP, etc.) using JavaScript's `BigInt` type.
For example, `$12.34` is `BigInt(1234)`.

### Sandbox vs Production

The `SQUARE_ENVIRONMENT` environment variable controls which Square environment is used:

| Value | Base URL |
|---|---|
| `sandbox` (default) | `https://connect.squareupsandbox.com` |
| `production` | `https://connect.squareup.com` |

---

## Next steps

- **Web Payments SDK** – Accept card-present payments in a browser using Square's hosted
  card input field: <https://developer.squareup.com/docs/web-payments/overview>
- **Webhooks** – React to payment events in real time:
  <https://developer.squareup.com/docs/webhooks/overview>
- **Orders API** – Model cart line items before capturing payment:
  <https://developer.squareup.com/docs/orders-api/overview>
- **Full SDK reference** – All available endpoints:
  <https://developer.squareup.com/reference/square>
