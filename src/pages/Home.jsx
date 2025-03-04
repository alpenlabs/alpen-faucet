import React, { useState } from "react";
import { useWallet } from "../providers/WalletProvider";
import { isAddress } from "ethers";
import AddressBadge from "../components/AddressBadge";
import { getPowChallenge, submitClaim } from "../utils/api";
import { findSolution } from "../utils/solver";
import "../styles/index.css";

const STRATA_BLOCKSCOUT_URL = import.meta.env.VITE_STRATA_BLOCKSCOUT_URL;

export default function Home() {
  const { walletAddress, connectWallet, disconnectWallet } = useWallet();
  const [manualEntry, setManualEntry] = useState(false);
  const [inputAddress, setInputAddress] = useState("");
  const [isInputValid, setIsInputValid] = useState(null);
  const [copied, setCopied] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tries, setTries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [solvingPoW, setSolvingPoW] = useState(false); // ✅ Track PoW solving
  const [txId, setTxId] = useState(null);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false); // ✅ Track if claim is done

  // ✅ Validate Address on Input Change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputAddress(value);
    setIsInputValid(isAddress(value));
  };

  const handleEnterAddress = () => {
    if (isInputValid) {
      connectWallet(inputAddress);
      setWalletConnected(true);
    }
  };

  // ✅ Copy Address (No State Change)
  const handleCopyAddress = () => {
    if (walletAddress || inputAddress) {
      navigator.clipboard.writeText(walletAddress || inputAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ✅ Handle Disconnect for Manual & MetaMask Cases
  const handleDisconnect = () => {
    setInputAddress("");  // ✅ Clears manually entered address
    setIsInputValid(null);  // ✅ Resets validation state
    disconnectWallet();  // ✅ Clears `walletAddress`
    setManualEntry(false);  // ✅ Reset back to initial screen
    setWalletConnected(false);
  };

  // ✅ Claim test BTC by solving Proof of Work challenge
  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    // ✅ Step 1: Get PoW challenge from the backend
    const response = await getPowChallenge();
    if (!response) {
      setError("Failed to fetch PoW challenge. Try again.");
      setLoading(false);
      return;
    }

<<<<<<< HEAD
=======
    setChallenge(response);
>>>>>>> a1147ff (PoW solution is sent, but getting 500 error)
    setTries(0); // Reset attempt counter
    setSolvingPoW(true); // ✅ Disable Confirm button while solving

    // ✅ Step 2: Find solution using solver.js
    const foundSolution = await findSolution(response.nonce, response.difficulty, setTries);
    if (!foundSolution) {
      setError("Failed to solve challenge.");
      setLoading(false);
      setSolvingPoW(false);
      return;
    }

    setSolvingPoW(false);

    // ✅ Step 3: Submit the claim request
    const claimResponse = await submitClaim(foundSolution, walletAddress);
    if (!claimResponse) {
      setError("Claim submission failed.");
    } else {
      // ✅ Step 4: Store the TXID & Mark as Completed
      setTxId(claimResponse || "Pending");
    }
    setCompleted(true); // ✅ Show "Start Over" button
    setLoading(false);
  };

  // ✅ Handle Reset (Start Over)
  const handleReset = () => {
    setTries(0);
    setLoading(false);
    setSolvingPoW(false);
    setTxId(null);
    setError("");
    setCompleted(false); // ✅ Reset state to allow new PoW solving
  };

  // ✅ Step 1: Connect Wallet OR Enter Address
  if (!walletAddress && !walletConnected) {
    return (
      <div className="home-container">
        <img src="/logo.png" alt="Strata Logo" className="home-logo" />

        <div className="home-box">
          <div className="home-title">Get test BTC</div>
          {!manualEntry ? (
            <>
              <button className="home-button" onClick={connectWallet}>
                Connect wallet
              </button>
              <p className="home-link" onClick={() => setManualEntry(true)}>
                or enter address
              </p>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Paste your address 0x..."
                className={`home-input ${inputAddress && !isInputValid ? "input-error" : ""}`}
                value={inputAddress}
                onChange={handleInputChange}
              />
              {isInputValid === false && <span className="error-message">Invalid entry. Please enter a valid Strata address.</span>}
              <button className="enter-button mt-2" disabled={!isInputValid} onClick={handleEnterAddress}>
                Enter
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ✅ Step 2: Show Wallet Info + Confirmation
  return (
    <div className="home-container">
      <img src="/logo.png" alt="Strata Logo" className="home-logo" />

      {/* ✅ Wallet Info (Top Right) */}
      <div className="wallet-info">
        <AddressBadge address={walletAddress || inputAddress} onDisconnect={handleDisconnect} />
      </div>

      {/* ✅ Confirmation Section */}
      <div className="home-box">
        <div className="home-title">Get test BTC</div>
        <div className="confirmation-grid">
          <div className="grid-row"><span className="grid-label">Amount: </span> <span>10 BTC</span></div>
          <div className="grid-row"><span className="grid-label">Proof of work: </span> <span>{tries > 0 ? `${tries} tries` : "-"}</span></div>
          <div className="grid-row"><span className="grid-label">TXID: </span> <span>
          {txId ? (
            <a href={`${STRATA_BLOCKSCOUT_URL}/tx/${txId}`} target="_blank" rel="noopener noreferrer" className="txid-link">
              {txId.slice(0, 6)}...{txId.slice(-4)}
            </a>
          ) : (
            "-"
          )}</span></div>
        </div>
        {/* ✅ Show Error Message If Needed */}
        {error && <p className="error-message">{error}</p>}

        {/* ✅ Confirm Button → Becomes "Start Over" When Done */}
        <button 
          className="confirm-button mt-4"
          onClick={completed ? handleReset : handleConfirm} 
          disabled={loading || solvingPoW}
        >
          {completed ? "Start Over" : "Confirm"}
        </button>
      </div>
    </div>
  );
}
