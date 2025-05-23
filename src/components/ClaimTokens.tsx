import React, { useState, useEffect } from "react";
import { useFaucetApi } from "../utils/api";
import { findSolution } from "../utils/solver";
import { FaucetResult, PowChallenge } from "../types/faucet";
import { useConfig } from "../hooks/useConfig";
import styles from "../styles/ClaimTokens.module.css";

interface ClaimTokensProps {
    walletAddress: string;
    manualEntry: boolean;
    claimAmount: string | null;
    claimAmountError: boolean;
    onManualEntryReset: () => void;
}

const ClaimTokens = ({
    walletAddress,
    manualEntry,
    claimAmount,
    claimAmountError,
    onManualEntryReset,
}: ClaimTokensProps) => {
    const [tries, setTries] = useState(0);
    const [txId, setTxId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [completed, setCompleted] = useState(false);
    const [claiming, setClaiming] = useState(false);

    const { getPowChallenge, submitClaim } = useFaucetApi();
    const { alpenExplorerUrl } = useConfig();

    useEffect(() => {
        if (claimAmountError) {
            setError("Failed to fetch claim amount.");
        } else {
            setError("");
        }
    }, [claimAmountError]);

    const handleConfirm = async () => {
        setError("");
        setClaiming(true);

        const powRes: FaucetResult<PowChallenge> = await getPowChallenge("l2");
        if (!powRes.ok) {
            setError(`${powRes.error}`);
            setClaiming(false);
            return;
        }

        setTries(0);

        const solRes = await findSolution(
            powRes.data.nonce,
            powRes.data.difficulty,
            setTries,
        );
        if (!solRes.ok) {
            setError("Failed to solve PoW challenge.");
            setClaiming(false);
            return;
        }

        const claimRes = await submitClaim(solRes.data, walletAddress);
        if (!claimRes.ok) {
            setError(`${claimRes.error}`);
        } else {
            setTxId(claimRes.data);
        }

        setClaiming(false);
        setCompleted(true);
    };

    const handleReset = () => {
        if (manualEntry) {
            onManualEntryReset();
        } else {
            setTries(0);
            setTxId(null);
            setError("");
        }
        setClaiming(false);
        setCompleted(false);
    };

    return (
        <>
            <div className={styles.title}>
                <span>Get test BTC</span>
                <span>for Alpen Testnet</span>
            </div>

            <div className={styles.confirmationGrid}>
                <div className={styles.gridRow}>
                    <span className={styles.gridLabel}>Amount:</span>
                    <span className={styles.gridValue}>
                        {claimAmount ? `${claimAmount} BTC` : "-"}
                    </span>
                </div>

                {manualEntry && (
                    <div className={styles.gridRow}>
                        <span className={styles.gridLabel}>Address:</span>
                        <span className={styles.gridValue}>
                            <a
                                href={`${alpenExplorerUrl}/address/${walletAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.addressLink}
                            >
                                {walletAddress.slice(0, 6)}...
                                {walletAddress.slice(-4)}
                            </a>
                        </span>
                    </div>
                )}

                <div className={styles.gridRow}>
                    <span className={styles.gridLabel}>Proof of Work:</span>
                    <span className={styles.gridValue}>
                        {tries > 0 ? tries : "-"}
                    </span>
                </div>

                <div className={styles.gridRow}>
                    <span className={styles.gridLabel}>TXID:</span>
                    <span className={styles.gridValue}>
                        {txId ? (
                            <a
                                href={`${alpenExplorerUrl}/tx/${txId}`}
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
                disabled={claimAmountError || claiming}
            >
                {completed ? "Start Over" : "Confirm"}
            </button>
        </>
    );
};

export default ClaimTokens;
