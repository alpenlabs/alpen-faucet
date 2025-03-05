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
      console.error("Failed to fetch Proof of Work:", error);
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

      if (!res.ok) {
          // ✅ Attempt to parse error as JSON, otherwise return raw text
          let errorMessage;
          try {
              const errorJson = await res.json();
              errorMessage = errorJson.error || JSON.stringify(errorJson);
          } catch {
              errorMessage = await res.text();
          }
          console.error("Failed to claim test BTC", errorMessage);
          return null;
      }

      // ✅ On success, return the raw TXID as text
      const txid = await res.text();
      console.log("Claim TXID:", txid); // ✅ Debugging

      return txid.trim(); // ✅ Remove extra spaces/newlines
  } catch (error) {
      console.error("Failed to submit claim:", error);
      return null;
  }
}
