import { randomUUID } from "crypto";
import type { SquareClient } from "square";
import type { Square } from "square";

type Currency = Square.Currency;

/**
 * Issues a full or partial refund against a completed payment.
 *
 * @param client    – Configured SquareClient
 * @param paymentId – ID of the payment to refund
 * @param amountCents – Amount to refund in smallest currency unit (e.g. cents)
 * @param currency  – ISO 4217 currency code, defaults to "USD"
 * @param reason    – Optional human-readable reason for the refund
 */
export async function refundPayment(
  client: SquareClient,
  paymentId: string,
  amountCents: number,
  currency: Currency = "USD",
  reason?: string
): Promise<Square.PaymentRefund> {
  const response = await client.refunds.refundPayment({
    idempotencyKey: randomUUID(),
    paymentId,
    amountMoney: {
      amount: BigInt(amountCents),
      currency,
    },
    reason,
  });
  if (!response.refund) {
    throw new Error("Refund failed: response contained no refund object");
  }
  return response.refund;
}

/**
 * Lists refunds for the account (up to `limit` results).
 */
export async function listRefunds(
  client: SquareClient,
  limit: number = 10
): Promise<Square.PaymentRefund[]> {
  const refunds: Square.PaymentRefund[] = [];
  for await (const refund of await client.refunds.list({ limit })) {
    refunds.push(refund);
    if (refunds.length >= limit) break;
  }
  return refunds;
}
