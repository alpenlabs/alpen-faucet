import { useConfig } from "../providers/ConfigProvider";
import { FaucetResult, PowChallenge, ClaimTxid } from "../types/faucet";

/**
 * Handles a fetch response, detecting JSON or plain text, and returns a typed result.
 */
async function handleResponse<T>(res: Response): Promise<FaucetResult<T>> {
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
 * Custom hook that provides faucet-related API methods using runtime config.
 */
export function useFaucetApi() {
    const { faucetApiUrl } = useConfig();

    /**
     * Wraps a fetch call with standard error handling and logging.
     */
    async function safeFetchJson<T>(
        endpoint: string,
        context: string
    ): Promise<FaucetResult<T>> {
        if (!faucetApiUrl) {
            return {
                ok: false,
                error: "faucetApiUrl is not set",
            };
        }

        try {
            const res = await fetch(`${faucetApiUrl}/${endpoint}`);
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
    function getClaimAmount(chain: string): Promise<FaucetResult<string>> {
        return safeFetchJson<string>(
            `sats_to_claim/${chain}`,
            "Failed to get claim amount"
        );
    }

    /**
     * Requests a PoW challenge for the specified chain.
     */
    function getPowChallenge(chain: string): Promise<FaucetResult<PowChallenge>> {
        return safeFetchJson<PowChallenge>(
            `pow_challenge/${chain}`,
            "Failed to fetch Proof of Work"
        );
    }

    /**
     * Submits a claim to the faucet with the provided solution and address.
     */
    function submitClaim(solution: string, address: string): Promise<FaucetResult<ClaimTxid>> {
        return safeFetchJson<ClaimTxid>(
            `claim_l2/${solution}/${address}`,
            "Failed to claim test BTC"
        );
    }

    return {
        getClaimAmount,
        getPowChallenge,
        submitClaim,
    };
}
