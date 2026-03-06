/**
 * Unit tests for src/locations.ts
 */

import { listLocations, getLocation, getDefaultLocation } from "../src/locations";
import type { SquareClient } from "square";
import type { Square } from "square";

const activeLocation: Square.Location = {
  id: "loc_active",
  name: "Main Store",
  status: "ACTIVE",
  country: "US",
  currency: "USD",
};

const inactiveLocation: Square.Location = {
  id: "loc_inactive",
  name: "Old Store",
  status: "INACTIVE",
  country: "US",
  currency: "USD",
};

function buildMockClient(locations: Square.Location[] = [activeLocation]): SquareClient {
  return {
    locations: {
      list: jest.fn().mockResolvedValue({ locations }),
      get: jest.fn().mockImplementation(({ locationId }: { locationId: string }) => {
        const loc = locations.find((l) => l.id === locationId);
        return Promise.resolve({ location: loc });
      }),
    },
  } as unknown as SquareClient;
}

describe("listLocations()", () => {
  it("returns array of locations", async () => {
    const client = buildMockClient([activeLocation, inactiveLocation]);
    const result = await listLocations(client);
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("loc_active");
  });

  it("returns empty array when no locations found", async () => {
    const client = buildMockClient([]);
    const result = await listLocations(client);
    expect(result).toEqual([]);
  });
});

describe("getLocation()", () => {
  it("returns the matching location", async () => {
    const client = buildMockClient([activeLocation]);
    const result = await getLocation(client, "loc_active");
    expect(result.id).toBe("loc_active");
    expect(result.name).toBe("Main Store");
  });

  it("throws when location is not found", async () => {
    const client = buildMockClient([]);
    await expect(getLocation(client, "missing_id")).rejects.toThrow("missing_id");
  });
});

describe("getDefaultLocation()", () => {
  it("returns the first ACTIVE location when one exists", async () => {
    const client = buildMockClient([inactiveLocation, activeLocation]);
    const result = await getDefaultLocation(client);
    expect(result.id).toBe("loc_active");
  });

  it("falls back to the first location when none are ACTIVE", async () => {
    const client = buildMockClient([inactiveLocation]);
    const result = await getDefaultLocation(client);
    expect(result.id).toBe("loc_inactive");
  });

  it("throws when there are no locations at all", async () => {
    const client = buildMockClient([]);
    await expect(getDefaultLocation(client)).rejects.toThrow("No locations found");
  });
});
