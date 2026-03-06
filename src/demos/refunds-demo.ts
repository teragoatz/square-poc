/**
 * Refunds Demo
 *
 * Run: npm run demo:refunds
 *
 * Demonstrates issuing a refund against an existing payment.
 *
 * Prerequisites:
 *   – A COMPLETED payment ID.  If you don't have one, run demo:payments first
 *     and copy the payment ID shown in the output.
 *   – Set SQUARE_PAYMENT_ID in your .env file (or pass it as an argument).
 */

import * as dotenv from "dotenv";
dotenv.config();

import { createSquareClient, isSandbox } from "../client";
import { refundPayment, listRefunds } from "../refunds";

async function main(): Promise<void> {
  console.log(`\n=== Square Refunds Demo (${isSandbox() ? "SANDBOX" : "PRODUCTION"}) ===\n`);

  const paymentId = process.argv[2] ?? process.env["SQUARE_PAYMENT_ID"];
  if (!paymentId) {
    console.error(
      "Usage:  npm run demo:refunds -- <payment_id>\n" +
        "   or:  set SQUARE_PAYMENT_ID=<payment_id> in .env and re-run.\n\n" +
        "You need a COMPLETED payment ID. Run npm run demo:payments first."
    );
    process.exit(1);
  }

  const client = createSquareClient();

  // Issue a $1.00 partial refund
  console.log(`Issuing a $1.00 refund against payment ${paymentId}...`);
  const refund = await refundPayment(client, paymentId, 100, "USD", "Demo refund from Square PoC");
  console.log(`  Refund ID: ${refund.id}`);
  console.log(`  Status:    ${refund.status}`);
  console.log(`  Amount:    ${refund.amountMoney?.amount} ${refund.amountMoney?.currency}\n`);

  // List recent refunds
  console.log("Listing up to 5 recent refunds...");
  const recent = await listRefunds(client, 5);
  for (const r of recent) {
    console.log(
      `  ${r.id}  ${r.status?.padEnd(12)}  ${r.amountMoney?.amount} ${r.amountMoney?.currency}`
    );
  }
  console.log("");
}

main().catch((err: unknown) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
