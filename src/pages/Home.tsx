import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import WalletInfo from "../components/WalletInfo";
import ConnectWallet from "../components/ConnectWallet";
import ManualWalletEntry from "../components/ManualWalletEntry";
import ClaimTokens from "../components/ClaimTokens";
import { useWallet } from "../providers/WalletProvider";
import { getClaimAmount } from "../utils/api";
import { FaucetResult, WalletAddress } from "../types/faucet";
import "../styles/index.css";

const Home = () => {
  const { walletAddress, connectWallet, connectManual, disconnectWallet } = useWallet();
  const [manualEntry, setManualEntry] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [claimAmount, setClaimAmount] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch claimable amount on load
  useEffect(() => {
    async function fetchAmount() {
      const res: FaucetResult<string> = await getClaimAmount("l2");
      if (res.ok) {
        const sats = parseInt(res.data, 10);
        const btc = (sats / 100_000_000).toFixed(2);
        setClaimAmount(btc);
      } else {
        alert("Failed to fetch claim amount. Check the faucet endpoint.");
      }
    }

    fetchAmount();
  }, []);

  const handleManualConnect = (address: WalletAddress) => {
    connectManual(address);
    setWalletConnected(true);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setManualEntry(false);
    setWalletConnected(false);
  };

  const addressToShow = walletAddress || undefined;

  return (
    <>
      <Header />

      {/* Show wallet info at top-right when connected */}
      {walletConnected && addressToShow && (
        <WalletInfo address={addressToShow} onDisconnect={handleDisconnect} />
      )}

      <div className="container">
        {!walletConnected ? (
          <div className="box">
            {!manualEntry ? (
              <ConnectWallet
                onConnect={() => {
                  connectWallet();
                  setWalletConnected(true);
                }}
                onManual={() => setManualEntry(true)}
              />
            ) : (
              <ManualWalletEntry onManualConnect={handleManualConnect} />
            )}
          </div>
        ) : (
          <ClaimTokens walletAddress={walletAddress!} claimAmount={claimAmount} />
        )}
      </div>
    </>
  );
};

export default Home;
