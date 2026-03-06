import { randomUUID } from "crypto";
import type { SquareClient } from "square";
import type { Square } from "square";

type Currency = Square.Currency;

/**
 * Creates a payment using the "nonce" source ID.
 *
 * In the sandbox you can use the magic source ID "cnon:card-nonce-ok" to
 * simulate a successful card-present payment without a real card.
 *
 * @param client   – Configured SquareClient
 * @param amountCents – Amount in the smallest currency unit (e.g. cents for USD)
 * @param currency – ISO 4217 currency code, defaults to "USD"
 * @param sourceId – Payment source nonce (use "cnon:card-nonce-ok" for sandbox)
 * @param locationId – The Square location ID to associate the payment with
 * @param note – Optional note to attach to the payment
 */
export async function createPayment(
  client: SquareClient,
  amountCents: number,
  currency: Currency = "USD",
  sourceId: string = "cnon:card-nonce-ok",
  locationId?: string,
  note?: string
): Promise<Square.Payment> {
  const response = await client.payments.create({
    sourceId,
    idempotencyKey: randomUUID(),
    amountMoney: {
      amount: BigInt(amountCents),
      currency,
    },
    locationId,
    note,
  });

  if (!response.payment) {
    throw new Error("Payment creation failed: response contained no payment");
  }
  return response.payment;
}

/**
 * Retrieves a single payment by its ID.
 */
export async function getPayment(
  client: SquareClient,
  paymentId: string
): Promise<Square.Payment> {
  const response = await client.payments.get({ paymentId });
  if (!response.payment) {
    throw new Error(`Payment ${paymentId} not found`);
  }
  return response.payment;
}

/**
 * Lists all payments for the account (newest first, up to `limit` results).
 */
export async function listPayments(
  client: SquareClient,
  limit: number = 10
): Promise<Square.Payment[]> {
  const payments: Square.Payment[] = [];
  for await (const payment of await client.payments.list({ limit })) {
    payments.push(payment);
    if (payments.length >= limit) break;
  }
  return payments;
}

/**
 * Cancels (voids) a payment that has not yet been completed.
 */
export async function cancelPayment(
  client: SquareClient,
  paymentId: string
): Promise<Square.Payment> {
  const response = await client.payments.cancel({ paymentId });
  if (!response.payment) {
    throw new Error(`Failed to cancel payment ${paymentId}`);
  }
  return response.payment;
}
