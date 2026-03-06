/**
 * Unit tests for src/customers.ts
 */

import { createCustomer, getCustomer, listCustomers, deleteCustomer } from "../src/customers";
import type { SquareClient } from "square";
import type { Square } from "square";

const mockCustomer: Square.Customer = {
  id: "cust_001",
  givenName: "Jane",
  familyName: "Doe",
  emailAddress: "jane@example.com",
  createdAt: "2024-01-01T00:00:00Z",
};

function buildMockClient(overrides: Partial<SquareClient["customers"]> = {}): SquareClient {
  return {
    customers: {
      create: jest.fn().mockResolvedValue({ customer: mockCustomer }),
      get: jest.fn().mockResolvedValue({ customer: mockCustomer }),
      delete: jest.fn().mockResolvedValue({}),
      list: jest.fn().mockReturnValue(
        (async function* () {
          yield mockCustomer;
        })()
      ),
      ...overrides,
    },
  } as unknown as SquareClient;
}

describe("createCustomer()", () => {
  it("creates a customer and returns the customer object", async () => {
    const client = buildMockClient();
    const result = await createCustomer(client, "Jane", "Doe", "jane@example.com");
    expect(result.id).toBe("cust_001");
    expect(client.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({ givenName: "Jane", familyName: "Doe" })
    );
  });

  it("throws when response contains no customer", async () => {
    const client = buildMockClient({
      create: jest.fn().mockResolvedValue({ customer: undefined }),
    });
    await expect(createCustomer(client, "John", "Smith")).rejects.toThrow("Customer creation failed");
  });
});

describe("getCustomer()", () => {
  it("retrieves a customer by ID", async () => {
    const client = buildMockClient();
    const result = await getCustomer(client, "cust_001");
    expect(result.id).toBe("cust_001");
  });

  it("throws when customer not found", async () => {
    const client = buildMockClient({
      get: jest.fn().mockResolvedValue({ customer: undefined }),
    });
    await expect(getCustomer(client, "missing")).rejects.toThrow("missing");
  });
});

describe("listCustomers()", () => {
  it("returns up to limit customers", async () => {
    const client = buildMockClient({
      list: jest.fn().mockReturnValue(
        (async function* () {
          yield { ...mockCustomer, id: "c1" };
          yield { ...mockCustomer, id: "c2" };
          yield { ...mockCustomer, id: "c3" };
        })()
      ),
    });

    const result = await listCustomers(client, 2);
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("c1");
  });
});

describe("deleteCustomer()", () => {
  it("calls the delete endpoint without throwing", async () => {
    const client = buildMockClient();
    await expect(deleteCustomer(client, "cust_001")).resolves.toBeUndefined();
    expect(client.customers.delete).toHaveBeenCalledWith({ customerId: "cust_001" });
  });
});
