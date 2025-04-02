const STRATA_FAUCET_URL = import.meta.env.VITE_STRATA_FAUCET_URL;

/**
 * Handles a fetch response, auto-detecting JSON or plain text.
 * Returns an object with { ok: true, data } or { ok: false, error }.
 *
 * @param {Response} res - The fetch Response object.
 * @returns {Promise<{ ok: true, data: any } | { ok: false, error: string }>}
 */
export async function handleResponse(res) {
    const raw = await res.text(); // read body once
  
    if (!res.ok) {
        return { ok: false, error: raw };
    }

    // Response is OK — try to parse as JSON
    try {
      const data = JSON.parse(raw);
      return { ok: true, data };
    } catch {
      return { ok: true, data: raw.trim() }; // fallback to plain text
    }
}

/**
 * Calls the faucet-api url. On error, logs the error with given context.
 * @returns {Promise<Object|null>} Response from the backend.
 */
async function safeFetchJson(url, context) {
    try {
        const res = await fetch(url);
        const result = await handleResponse(res);
  
        if (!result.ok) {
            console.error(`${context}:`, result.error);
            return null;
        }
  
        return result.data;
    } catch (e) {
        const errorMessage = e && typeof e === 'object' ? (e.message || JSON.stringify(e)) : String(e);
        console.error(`${context}:`, errorMessage);
        return null;
    }
}

/**
 * Calls the faucet's /pow_challenge endpoint.
 * @returns {Promise<Object|null>} Response from the backend.
 */
export function getClaimAmount(chain) {
    return safeFetchJson(`${STRATA_FAUCET_URL}/sats_to_claim/${chain}`, "Failed to get claim amount");
}

/**
 * Calls the faucet's /pow_challenge endpoint.
 * @returns {Promise<Object|null>} Response from the backend.
 */
export function getPowChallenge(chain) {
    return safeFetchJson(`${STRATA_FAUCET_URL}/pow_challenge/${chain}`, "Failed to fetch Proof of Work");
}

/**
 * Calls the faucet's /claim_l2/:solution/:address endpoint.
 * @param {string} solution - The solution found for the PoW challenge.
 * @param {string} address - The user's Ethereum address.
 * @returns {Promise<Object>} Response from the backend.
 */
export async function submitClaim(solution, address) {
    const txid = await safeFetchJson(
        `${STRATA_FAUCET_URL}/claim_l2/${solution}/${address}`,
        "Failed to claim test BTC"
    );
  
    if (!txid) return null;
    return txid.trim();
}
