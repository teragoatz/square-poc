/**
 * Unit tests for src/client.ts
 *
 * These tests use Jest mocking to avoid real HTTP calls.
 */

import { isSandbox, createSquareClient } from "../src/client";

describe("isSandbox()", () => {
  const original = process.env["SQUARE_ENVIRONMENT"];

  afterEach(() => {
    if (original === undefined) {
      delete process.env["SQUARE_ENVIRONMENT"];
    } else {
      process.env["SQUARE_ENVIRONMENT"] = original;
    }
  });

  it("returns true when SQUARE_ENVIRONMENT is unset", () => {
    delete process.env["SQUARE_ENVIRONMENT"];
    expect(isSandbox()).toBe(true);
  });

  it("returns true when SQUARE_ENVIRONMENT=sandbox", () => {
    process.env["SQUARE_ENVIRONMENT"] = "sandbox";
    expect(isSandbox()).toBe(true);
  });

  it("returns true when SQUARE_ENVIRONMENT=SANDBOX (case-insensitive)", () => {
    process.env["SQUARE_ENVIRONMENT"] = "SANDBOX";
    expect(isSandbox()).toBe(true);
  });

  it("returns false when SQUARE_ENVIRONMENT=production", () => {
    process.env["SQUARE_ENVIRONMENT"] = "production";
    expect(isSandbox()).toBe(false);
  });
});

describe("createSquareClient()", () => {
  const originalToken = process.env["SQUARE_ACCESS_TOKEN"];
  const originalEnv = process.env["SQUARE_ENVIRONMENT"];

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env["SQUARE_ACCESS_TOKEN"];
    } else {
      process.env["SQUARE_ACCESS_TOKEN"] = originalToken;
    }
    if (originalEnv === undefined) {
      delete process.env["SQUARE_ENVIRONMENT"];
    } else {
      process.env["SQUARE_ENVIRONMENT"] = originalEnv;
    }
  });

  it("throws when SQUARE_ACCESS_TOKEN is not set", () => {
    delete process.env["SQUARE_ACCESS_TOKEN"];
    expect(() => createSquareClient()).toThrow("SQUARE_ACCESS_TOKEN");
  });

  it("returns a SquareClient instance when token is provided", () => {
    process.env["SQUARE_ACCESS_TOKEN"] = "sandbox-test-token";
    process.env["SQUARE_ENVIRONMENT"] = "sandbox";
    const client = createSquareClient();
    expect(client).toBeDefined();
    expect(typeof client.payments).toBe("object");
    expect(typeof client.locations).toBe("object");
    expect(typeof client.customers).toBe("object");
    expect(typeof client.refunds).toBe("object");
  });
});
