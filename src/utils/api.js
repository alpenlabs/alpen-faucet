const STRATA_FAUCET_URL = import.meta.env.VITE_STRATA_FAUCET_URL || "http://localhost:8080";

/**
 * Calls the faucet's /pow_challenge endpoint.
 * @returns {Promise<Object|null>} Response from the backend.
 */
export async function getPowChallenge() {
    try {
      const res = await fetch(`${STRATA_FAUCET_URL}/pow_challenge`, {
        method: "GET",
      });
  
      // ✅ Check if response is valid JSON
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error("Invalid response from server");
  
      return data;
    } catch (error) {
      console.error("Error fetching PoW challenge:", error);
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
      const res = await fetch(`${STRATA_FAUCET_URL}/claim_l2/${solution}/${address}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to submit claim");
      return await res.json();
    } catch (error) {
      console.error("Error submitting claim:", error);
      return null;
    }
}
