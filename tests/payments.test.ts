/**
 * Unit tests for src/payments.ts
 *
 * All Square API calls are mocked so tests run without network access.
 */

import { createPayment, getPayment, listPayments, cancelPayment } from "../src/payments";
import type { SquareClient } from "square";
import type { Square } from "square";

const mockPayment: Square.Payment = {
  id: "pay_test_001",
  status: "COMPLETED",
  amountMoney: { amount: BigInt(1234), currency: "USD" },
  createdAt: "2024-01-01T00:00:00Z",
};

function buildMockClient(overrides: Partial<SquareClient["payments"]> = {}): SquareClient {
  return {
    payments: {
      create: jest.fn().mockResolvedValue({ payment: mockPayment }),
      get: jest.fn().mockResolvedValue({ payment: mockPayment }),
      cancel: jest.fn().mockResolvedValue({ payment: { ...mockPayment, status: "CANCELED" } }),
      list: jest.fn().mockReturnValue(
        (async function* () {
          yield mockPayment;
        })()
      ),
      ...overrides,
    },
  } as unknown as SquareClient;
}

describe("createPayment()", () => {
  it("creates a payment and returns the payment object", async () => {
    const client = buildMockClient();
    const result = await createPayment(client, 1234, "USD", "cnon:card-nonce-ok", "loc_1", "note");
    expect(result).toEqual(mockPayment);
    expect(client.payments.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceId: "cnon:card-nonce-ok",
        amountMoney: { amount: BigInt(1234), currency: "USD" },
        locationId: "loc_1",
        note: "note",
      })
    );
  });

  it("throws when the response contains no payment", async () => {
    const client = buildMockClient({
      create: jest.fn().mockResolvedValue({ payment: undefined }),
    });
    await expect(createPayment(client, 500)).rejects.toThrow("Payment creation failed");
  });
});

describe("getPayment()", () => {
  it("retrieves a payment by ID", async () => {
    const client = buildMockClient();
    const result = await getPayment(client, "pay_test_001");
    expect(result.id).toBe("pay_test_001");
    expect(client.payments.get).toHaveBeenCalledWith({ paymentId: "pay_test_001" });
  });

  it("throws when payment is not found", async () => {
    const client = buildMockClient({
      get: jest.fn().mockResolvedValue({ payment: undefined }),
    });
    await expect(getPayment(client, "missing")).rejects.toThrow("missing");
  });
});

describe("listPayments()", () => {
  it("returns up to limit payments from the iterator", async () => {
    const payments = [
      { ...mockPayment, id: "p1" },
      { ...mockPayment, id: "p2" },
      { ...mockPayment, id: "p3" },
    ];
    const client = buildMockClient({
      list: jest.fn().mockReturnValue(
        (async function* () {
          for (const p of payments) yield p;
        })()
      ),
    });

    const result = await listPayments(client, 2);
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("p1");
    expect(result[1]?.id).toBe("p2");
  });

  it("returns all payments when fewer than limit exist", async () => {
    const client = buildMockClient({
      list: jest.fn().mockReturnValue(
        (async function* () {
          yield { ...mockPayment, id: "only_one" };
        })()
      ),
    });
    const result = await listPayments(client, 10);
    expect(result).toHaveLength(1);
  });
});

describe("cancelPayment()", () => {
  it("cancels a payment and returns the canceled payment", async () => {
    const client = buildMockClient();
    const result = await cancelPayment(client, "pay_test_001");
    expect(result.status).toBe("CANCELED");
    expect(client.payments.cancel).toHaveBeenCalledWith({ paymentId: "pay_test_001" });
  });

  it("throws when cancel response contains no payment", async () => {
    const client = buildMockClient({
      cancel: jest.fn().mockResolvedValue({ payment: undefined }),
    });
    await expect(cancelPayment(client, "pay_test_001")).rejects.toThrow("cancel payment");
  });
});
