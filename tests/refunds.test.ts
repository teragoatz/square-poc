/**
 * Unit tests for src/refunds.ts
 */

import { refundPayment, listRefunds } from "../src/refunds";
import type { SquareClient } from "square";
import type { Square } from "square";

const mockRefund: Square.PaymentRefund = {
  id: "refund_001",
  status: "COMPLETED",
  amountMoney: { amount: BigInt(100), currency: "USD" },
  paymentId: "pay_test_001",
  createdAt: "2024-01-01T00:00:00Z",
};

function buildMockClient(overrides: Partial<SquareClient["refunds"]> = {}): SquareClient {
  return {
    refunds: {
      refundPayment: jest.fn().mockResolvedValue({ refund: mockRefund }),
      list: jest.fn().mockReturnValue(
        (async function* () {
          yield mockRefund;
        })()
      ),
      ...overrides,
    },
  } as unknown as SquareClient;
}

describe("refundPayment()", () => {
  it("issues a refund and returns the refund object", async () => {
    const client = buildMockClient();
    const result = await refundPayment(client, "pay_test_001", 100, "USD", "test reason");
    expect(result.id).toBe("refund_001");
    expect(result.status).toBe("COMPLETED");
    expect(client.refunds.refundPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId: "pay_test_001",
        amountMoney: { amount: BigInt(100), currency: "USD" },
        reason: "test reason",
      })
    );
  });

  it("throws when response contains no refund object", async () => {
    const client = buildMockClient({
      refundPayment: jest.fn().mockResolvedValue({ refund: undefined }),
    });
    await expect(refundPayment(client, "pay_001", 50)).rejects.toThrow("Refund failed");
  });
});

describe("listRefunds()", () => {
  it("returns up to limit refunds", async () => {
    const client = buildMockClient({
      list: jest.fn().mockReturnValue(
        (async function* () {
          yield { ...mockRefund, id: "r1" };
          yield { ...mockRefund, id: "r2" };
          yield { ...mockRefund, id: "r3" };
        })()
      ),
    });

    const result = await listRefunds(client, 2);
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("r1");
    expect(result[1]?.id).toBe("r2");
  });

  it("returns empty array when no refunds exist", async () => {
    const client = buildMockClient({
      list: jest.fn().mockReturnValue(
        (async function* () {
          // yields nothing
        })()
      ),
    });
    const result = await listRefunds(client, 5);
    expect(result).toHaveLength(0);
  });
});
