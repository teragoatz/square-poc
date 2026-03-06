/**
 * Payments Demo
 *
 * Run: npm run demo:payments
 *
 * Demonstrates creating a payment in the Square sandbox using the magic
 * nonce "cnon:card-nonce-ok" which always succeeds without needing a real
 * card number.
 *
 * The demo will:
 *  1. List your sandbox locations to find a valid location ID
 *  2. Create a $12.34 payment
 *  3. Retrieve the payment back from the API to confirm it was stored
 *  4. Cancel the payment (moves it to CANCELED status)
 *  5. List the 5 most recent payments on the account
 */

import * as dotenv from "dotenv";
dotenv.config();

import { createSquareClient, isSandbox } from "../client";
import { createPayment, getPayment, cancelPayment, listPayments } from "../payments";
import { getDefaultLocation } from "../locations";

async function main(): Promise<void> {
  console.log(`\n=== Square Payments Demo (${isSandbox() ? "SANDBOX" : "PRODUCTION"}) ===\n`);

  const client = createSquareClient();

  // Step 1 – resolve the default location
  const location = await getDefaultLocation(client);
  console.log(`Using location: ${location.name} (${location.id})\n`);

  // Step 2 – create a payment using the sandbox magic nonce
  console.log("Creating a $12.34 payment with sandbox nonce 'cnon:card-nonce-ok'...");
  const payment = await createPayment(
    client,
    1234,       // $12.34 in cents
    "USD",
    "cnon:card-nonce-ok",   // sandbox magic nonce – always succeeds
    location.id,
    "Square PoC demo payment"
  );
  console.log(`  Created payment:  ${payment.id}`);
  console.log(`  Status:           ${payment.status}`);
  console.log(`  Amount:           ${payment.amountMoney?.amount} ${payment.amountMoney?.currency}\n`);

  // Step 3 – retrieve the payment back
  console.log("Retrieving the payment by ID...");
  const fetched = await getPayment(client, payment.id!);
  console.log(`  Fetched payment:  ${fetched.id} – status: ${fetched.status}\n`);

  // Step 4 – cancel the payment (only works on APPROVED/pending payments)
  if (payment.status === "APPROVED") {
    console.log("Canceling the payment...");
    const canceled = await cancelPayment(client, payment.id!);
    console.log(`  Canceled payment: ${canceled.id} – status: ${canceled.status}\n`);
  } else {
    console.log(`Skipping cancel – payment is in '${payment.status}' state, not APPROVED.\n`);
  }

  // Step 5 – list recent payments
  console.log("Listing the 5 most recent payments...");
  const recent = await listPayments(client, 5);
  for (const p of recent) {
    console.log(
      `  ${p.id}  ${p.status?.padEnd(12)}  ${p.amountMoney?.amount} ${p.amountMoney?.currency}  ${p.createdAt}`
    );
  }
  console.log("");
}

main().catch((err: unknown) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
