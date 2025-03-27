const STRATA_FAUCET_URL = import.meta.env.VITE_STRATA_FAUCET_URL;

export async function handleJsonResponse(res) {
    const responseText = await res.text(); // Read once

    if (res.ok) {
        return { ok: true, data: JSON.parse(responseText) }; // Success path
    }

    let errorMessage;
    try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.error || JSON.stringify(errorJson);
    } catch {
        errorMessage = responseText;
    }
    return { ok: false, error: errorMessage }
}

/**
 * Calls the faucet's /pow_challenge endpoint.
 * @returns {Promise<Object|null>} Response from the backend.
 */
export async function getClaimAmount(chain) {
    try {
        const res = await fetch(`${STRATA_FAUCET_URL}/sats_to_claim/${chain}`);

        const result = await handleJsonResponse(res);
        if (!result.ok) {
            console.error("Failed to get claim amount:", result.error);
            return null;
        }

        return result.data;
    } catch (error) {
        console.error(error.message || error);
        return null;
    }
}

/**
 * Calls the faucet's /pow_challenge endpoint.
 * @returns {Promise<Object|null>} Response from the backend.
 */
export async function getPowChallenge(chain) {
    try {
        const res = await fetch(`${STRATA_FAUCET_URL}/pow_challenge/${chain}`);

        const result = await handleJsonResponse(res);
        if (!result.ok) {
            console.error("Failed to fetch Proof of Work:", result.error);
            return null;
        }

        return result.data;
    } catch (error) {
        console.error(error.message || error);
        return null;
    }
}

/**
 * Calls the faucet's /claim_l2/:solution/:address endpoint.
 * @param {string} solution - The solution found for the PoW challenge.
 * @param {string} address - The user's Ethereum address.
 * @returns {Promise<Object>} Response from the backend.
 */
export async function submitClaim(solution, address) {
    try {
        const res = await fetch(`${STRATA_FAUCET_URL}/claim_l2/${solution}/${address}`);

        const result = await handleJsonResponse(res);
        if (!result.ok) {
            console.error("Failed to claim test BTC:", result.error);
            return null;
        }

        console.log("Claim TXID:", result.data);
        return result.data.trim();
    } catch (error) {
        console.error(error.message || error);
        return null;
    }
}
