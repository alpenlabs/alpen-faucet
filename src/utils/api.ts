import { FaucetResult, PowChallenge, ClaimTxid } from "../types/faucet";

const ALPEN_FAUCET_API_URL = import.meta.env.VITE_ALPEN_FAUCET_API_URL;

/**
 * Handles a fetch response, detecting JSON or plain text, and returns a typed result.
 */
export async function handleResponse<T>(res: Response): Promise<FaucetResult<T>> {
  const raw = await res.text();

  if (!res.ok) {
    return { ok: false, error: raw };
  }

  try {
    const data = JSON.parse(raw);
    return { ok: true, data };
  } catch {
    return { ok: true, data: raw.trim() as unknown as T };
  }
}

/**
 * Wraps a fetch call with standard error handling and logging.
 */
async function safeFetchJson<T>(url: string, context: string): Promise<FaucetResult<T>> {
  try {
    const res = await fetch(url);
    const result = await handleResponse<T>(res);

    if (!result.ok) {
      console.error(`${context}:`, result.error);
    }

    return result;
  } catch (e: any) {
    console.error(`${context}:`, e);
    return { ok: false, error: e.message || "Unknown error" };
  }
}

/**
 * Fetches the amount of BTC claimable based on network level.
 */
export function getClaimAmount(chain: string): Promise<FaucetResult<string>> {
  return safeFetchJson<string>(
    `${ALPEN_FAUCET_API_URL}/sats_to_claim/${chain}`,
    "Failed to get claim amount"
  );
}

/**
 * Requests a PoW challenge for the specified chain.
 */
export function getPowChallenge(chain: string): Promise<FaucetResult<PowChallenge>> {
  return safeFetchJson<PowChallenge>(
    `${ALPEN_FAUCET_API_URL}/pow_challenge/${chain}`,
    "Failed to fetch Proof of Work"
  );
}

/**
 * Submits a claim to the faucet with the provided solution and address.
 */
export function submitClaim(solution: string, address: string): Promise<FaucetResult<ClaimTxid>> {
  return safeFetchJson<ClaimTxid>(
    `${ALPEN_FAUCET_API_URL}/claim_l2/${solution}/${address}`,
    "Failed to claim test BTC"
  );
}
