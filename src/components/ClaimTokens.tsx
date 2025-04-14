import React, { useState } from "react";
import { getPowChallenge, submitClaim } from "../utils/api";
import { findSolution } from "../utils/solver";
import { FaucetResult, PowChallenge } from "../types/faucet";
import styles from "../styles/ClaimTokens.module.css";

const ALPEN_BLOCKSCOUT_URL = import.meta.env.VITE_ALPEN_BLOCKSCOUT_URL;

interface ClaimTokensProps {
  walletAddress: string;
  claimAmount: string | null;
}

const ClaimTokens = ({ walletAddress, claimAmount }: ClaimTokensProps) => {
  const [tries, setTries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [solvingPoW, setSolvingPoW] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    const powRes: FaucetResult<PowChallenge> = await getPowChallenge("l2");
    if (!powRes.ok) {
      setError(`Failed to fetch PoW challenge: ${powRes.error}`);
      setLoading(false);
      return;
    }

    setTries(0);
    setSolvingPoW(true);

    const solRes = await findSolution(powRes.data.nonce, powRes.data.difficulty, setTries);
    if (!solRes.ok) {
      setError("Failed to solve PoW challenge.");
      setLoading(false);
      setSolvingPoW(false);
      return;
    }

    setSolvingPoW(false);

    const claimRes = await submitClaim(solRes.data, walletAddress);
    if (!claimRes.ok) {
      setError(`Failed to claim test BTC: ${claimRes.error}`);
    } else {
      setTxId(claimRes.data);
    }

    setCompleted(true);
    setLoading(false);
  };

  const handleReset = () => {
    setTries(0);
    setLoading(false);
    setSolvingPoW(false);
    setTxId(null);
    setError("");
    setCompleted(false);
  };

  return (
    <div className={styles.box}>
      <div className={styles.title}>Get test BTC</div>

      <div className={styles.confirmationGrid}>
        <div className={styles.gridRow}>
          <span className={styles.gridLabel}>Amount:</span>
          <span className={styles.gridValue}>{claimAmount ? `${claimAmount} BTC` : "-"}</span>
        </div>
        <div className={styles.gridRow}>
          <span className={styles.gridLabel}>Address:</span>
          <span className={styles.gridValue}>
            <a
              href={`${ALPEN_BLOCKSCOUT_URL}/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.addressLink}
            >
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </a>
          </span>
        </div>
        <div className={styles.gridRow}>
          <span className={styles.gridLabel}>Proof of Work:</span>
          <span className={styles.gridValue}>{tries > 0 ? tries : "-"}</span>
        </div>
        <div className={styles.gridRow}>
          <span className={styles.gridLabel}>TXID:</span>
          <span className={styles.gridValue}>
            {txId ? (
              <a
                href={`${ALPEN_BLOCKSCOUT_URL}/tx/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.txidLink}
              >
                {txId.slice(0, 6)}...{txId.slice(-4)}
              </a>
            ) : (
              "-"
            )}
          </span>
        </div>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <button
        className={styles.confirmButton}
        onClick={completed ? handleReset : handleConfirm}
        disabled={loading || solvingPoW}
      >
        {completed ? "Start Over" : "Confirm"}
      </button>
    </div>
  );
};

export default ClaimTokens;
