/**
 * Locations Demo
 *
 * Run: npm run demo:locations
 *
 * Lists all Square locations for your sandbox account.
 * This is a great first check to confirm your access token is working.
 */

import * as dotenv from "dotenv";
dotenv.config();

import { createSquareClient, isSandbox } from "../client";
import { listLocations } from "../locations";

async function main(): Promise<void> {
  console.log(`\n=== Square Locations Demo (${isSandbox() ? "SANDBOX" : "PRODUCTION"}) ===\n`);

  const client = createSquareClient();
  const locations = await listLocations(client);

  if (locations.length === 0) {
    console.log("No locations found. Your sandbox account may not have any locations yet.");
    return;
  }

  console.log(`Found ${locations.length} location(s):\n`);
  for (const loc of locations) {
    console.log(`  ID:      ${loc.id}`);
    console.log(`  Name:    ${loc.name}`);
    console.log(`  Status:  ${loc.status}`);
    console.log(`  Country: ${loc.country}`);
    console.log(`  Currency:${loc.currency}`);
    console.log("");
  }
}

main().catch((err: unknown) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
