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

      // ✅ Read response ONCE as text
      const responseText = await res.text();

      // ✅ First check: If response is NOT OK (e.g., 500 error)
      if (!res.ok) {
          let errorMessage = "Unknown error";

          try {
              // ✅ Attempt to parse JSON error response from stored text
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || JSON.stringify(errorData);
          } catch {
              // ✅ If JSON parsing fails, use the raw response text
              errorMessage = responseText;
          }

          throw new Error(`Failed to fetch Proof of Work: ${errorMessage}`);
      }

      // ✅ Convert the successful response to JSON
      return JSON.parse(responseText);
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
      const res = await fetch(`${STRATA_FAUCET_URL}/claim_l2/${solution}/${address}`, {
          method: "GET",
      });

      // ✅ Read response once
      const responseText = await res.text(); 

      if (!res.ok) {
          // ✅ Attempt to parse error as JSON, otherwise return raw text
          let errorMessage;
          try {
              const errorJson = JSON.parse(responseText); // ✅ Parse already read text
              errorMessage = errorJson.error || JSON.stringify(errorJson);
          } catch {
              errorMessage = responseText; // ✅ Use plain text if JSON parsing fails
          }
          console.error("Failed to claim test BTC:", errorMessage);
          return null;
      }

      console.log("Claim TXID:", responseText); // ✅ Debugging
      return responseText.trim(); // ✅ Return trimmed TXID

  } catch (error) {
      console.error("Failed to submit claim:", error.message || error);
      return null;
  }
}
