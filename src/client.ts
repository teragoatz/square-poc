import { SquareClient, SquareEnvironment } from "square";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Returns true when the environment is configured for the sandbox.
 */
export function isSandbox(): boolean {
  const env = (process.env["SQUARE_ENVIRONMENT"] ?? "sandbox").toLowerCase();
  return env !== "production";
}

/**
 * Creates and returns a configured SquareClient instance.
 *
 * Reads the following environment variables:
 *   SQUARE_ACCESS_TOKEN  – Required. Your sandbox or production access token.
 *   SQUARE_ENVIRONMENT   – Optional. "sandbox" (default) or "production".
 */
export function createSquareClient(): SquareClient {
  const token = process.env["SQUARE_ACCESS_TOKEN"];
  if (!token) {
    throw new Error(
      "SQUARE_ACCESS_TOKEN environment variable is not set. " +
        "Copy .env.example to .env and add your sandbox access token."
    );
  }

  const environment = isSandbox()
    ? SquareEnvironment.Sandbox
    : SquareEnvironment.Production;

  return new SquareClient({ token, environment });
}
