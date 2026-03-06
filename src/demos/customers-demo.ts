/**
 * Customers Demo
 *
 * Run: npm run demo:customers
 *
 * Demonstrates creating, retrieving, listing, and deleting a customer
 * record using the Square Customers API.
 */

import * as dotenv from "dotenv";
dotenv.config();

import { createSquareClient, isSandbox } from "../client";
import { createCustomer, getCustomer, listCustomers, deleteCustomer } from "../customers";

async function main(): Promise<void> {
  console.log(`\n=== Square Customers Demo (${isSandbox() ? "SANDBOX" : "PRODUCTION"}) ===\n`);

  const client = createSquareClient();

  // Step 1 – create a test customer
  console.log("Creating a test customer...");
  const customer = await createCustomer(
    client,
    "Jane",
    "Doe",
    "jane.doe.test@example.com",
    "+15555550100"
  );
  console.log(`  Created:  ${customer.id}`);
  console.log(`  Name:     ${customer.givenName} ${customer.familyName}`);
  console.log(`  Email:    ${customer.emailAddress}\n`);

  // Step 2 – retrieve the customer by ID
  console.log("Retrieving customer by ID...");
  const fetched = await getCustomer(client, customer.id!);
  console.log(`  Fetched:  ${fetched.id} – ${fetched.givenName} ${fetched.familyName}\n`);

  // Step 3 – list customers (first 5)
  console.log("Listing up to 5 customers...");
  const list = await listCustomers(client, 5);
  for (const c of list) {
    console.log(`  ${c.id}  ${c.givenName} ${c.familyName}  ${c.emailAddress ?? "(no email)"}`);
  }
  console.log("");

  // Step 4 – delete the test customer we created
  console.log(`Deleting test customer ${customer.id}...`);
  await deleteCustomer(client, customer.id!);
  console.log("  Deleted successfully.\n");
}

main().catch((err: unknown) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
