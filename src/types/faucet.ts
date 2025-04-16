// Faucet challenge response
export interface PowChallenge {
    nonce: string;
    difficulty: number;
}

// Result type for success or error
export type FaucetResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: string };

// Wallet address (manual or connected)
export type WalletAddress = string;
// Txid on successful claim
export type ClaimTxid = string;
