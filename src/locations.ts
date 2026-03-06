import type { SquareClient } from "square";
import type { Square } from "square";

/**
 * Lists all locations for the authenticated seller account.
 */
export async function listLocations(
  client: SquareClient
): Promise<Square.Location[]> {
  const response = await client.locations.list();
  return response.locations ?? [];
}

/**
 * Retrieves a single location by its ID.
 */
export async function getLocation(
  client: SquareClient,
  locationId: string
): Promise<Square.Location> {
  const response = await client.locations.get({ locationId });
  if (!response.location) {
    throw new Error(`Location ${locationId} not found`);
  }
  return response.location;
}

/**
 * Returns the first active location, or the first location overall if none
 * are explicitly active. Useful as a default location for new payments.
 *
 * Throws if the account has no locations.
 */
export async function getDefaultLocation(
  client: SquareClient
): Promise<Square.Location> {
  const locations = await listLocations(client);
  if (locations.length === 0) {
    throw new Error("No locations found for this account");
  }
  const active = locations.find((l) => l.status === "ACTIVE");
  return active ?? locations[0]!;
}
