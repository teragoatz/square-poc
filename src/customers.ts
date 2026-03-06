import type { SquareClient } from "square";
import type { Square } from "square";

/**
 * Creates a new customer record.
 */
export async function createCustomer(
  client: SquareClient,
  givenName: string,
  familyName: string,
  emailAddress?: string,
  phoneNumber?: string
): Promise<Square.Customer> {
  const response = await client.customers.create({
    givenName,
    familyName,
    emailAddress,
    phoneNumber,
  });
  if (!response.customer) {
    throw new Error("Customer creation failed: response contained no customer");
  }
  return response.customer;
}

/**
 * Retrieves a single customer by ID.
 */
export async function getCustomer(
  client: SquareClient,
  customerId: string
): Promise<Square.Customer> {
  const response = await client.customers.get({ customerId });
  if (!response.customer) {
    throw new Error(`Customer ${customerId} not found`);
  }
  return response.customer;
}

/**
 * Lists customers for the account (up to `limit` results).
 */
export async function listCustomers(
  client: SquareClient,
  limit: number = 10
): Promise<Square.Customer[]> {
  const customers: Square.Customer[] = [];
  for await (const customer of await client.customers.list({ limit })) {
    customers.push(customer);
    if (customers.length >= limit) break;
  }
  return customers;
}

/**
 * Deletes a customer record by ID.
 */
export async function deleteCustomer(
  client: SquareClient,
  customerId: string
): Promise<void> {
  await client.customers.delete({ customerId });
}
