const STRATA_FAUCET_URL = import.meta.env.VITE_STRATA_FAUCET_URL;

/**
 * Calls the faucet-api url. On error, logs the error with given context.
 * @returns {Promise<Object|null>} Response from the backend.
 */
async function safeFetchJson(url, context) {
    try {
        const res = await fetch(url);
        const result = await handleJsonResponse(res);
  
        if (!result.ok) {
            console.error(`${context}:`, result.error);
            return null;
        }
  
        return result.data;
    } catch (error) {
        console.error(`${context}:`, error.message || error);
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
    console.log("Claim TXID:", txid);
    return txid.trim();
}
