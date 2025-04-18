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
    const {
        walletAddress,
        connectWallet,
        connectManual,
        disconnectWallet,
        isOnAlpenTestnet,
        switchToAlpenTestnet,
    } = useWallet();
    const [manualEntry, setManualEntry] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [claimAmount, setClaimAmount] = useState<string | null>(null);
    const [fetchingClaimAmount, setFetchingClaimAmount] = useState(true);
    const [claimAmountError, setClaimAmountError] = useState(false);

    // Fetch claim amount on load
    useEffect(() => {
        if (!walletAddress) return; // only run when wallet is connected

        if (walletAddress && isOnAlpenTestnet && !manualEntry) {
            setWalletConnected(true);
        } else {
            setWalletConnected(false);
        }

        async function fetchAmount() {
            setFetchingClaimAmount(true);
            try {
                const res: FaucetResult<string> = await getClaimAmount("l2");
                if (res.ok) {
                    const sats = parseInt(res.data, 10);
                    const btc = (sats / 100_000_000).toFixed(2);
                    console.log(`Claim amount: ${btc} BTC`);
                    setClaimAmount(btc);
                    setClaimAmountError(false);
                } else {
                    console.error("Failed to fetch claim amount:", res.error);
                    setClaimAmount(null);
                    setClaimAmountError(true);
                }
            } catch (err) {
                console.error("Failed to fetch claim amount:", err);
                setClaimAmount(null);
                setClaimAmountError(true);
            } finally {
                setFetchingClaimAmount(false);
            }
        }

        fetchAmount();
    }, [manualEntry, walletAddress, isOnAlpenTestnet]);

    const handleManualConnect = (address: WalletAddress) => {
        connectManual(address);
    };

    const handleDisconnect = () => {
        disconnectWallet();
        setManualEntry(false);
        setWalletConnected(false);
    };

    return (
        <>
            <Header />

            {/* Show wallet info at top-right when connected */}
            {walletConnected && walletAddress && (
                <WalletInfo
                    address={walletAddress}
                    onDisconnect={handleDisconnect}
                />
            )}

            <div className="container">
                {/* Wrong network. Need to switch to Alpen Testnet */}
                {walletAddress && !manualEntry && !isOnAlpenTestnet && (
                    <div className="networkErrorContainer">
                        <div className="networkErrorBox">
                            <span className="networkErrorTitle">
                                Wrong network
                            </span>
                            <p className="networkErrorText">
                                Your wallet is connected to the
                                wrong network. Please switch your
                                wallet to use the Alpen Testnet
                                network.
                                <br />
                                <a
                                    href="https://docs.alpenlabs.io/welcome/wallet-setup"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="networkErrorLink"
                                >
                                    Learn more
                                </a>
                            </p>
                            <button
                                className="switchButton"
                                onClick={switchToAlpenTestnet}
                            >
                                Switch
                            </button>
                        </div>
                    </div>
                )}
                {/* Have wallet address (manually entered or connected to Alpen Testnet) */}
                {walletAddress && (isOnAlpenTestnet || manualEntry) ? (
                    <ClaimTokens
                        walletAddress={walletAddress!}
                        manualEntry={manualEntry}
                        claimAmount={claimAmount}
                        claimAmountError={claimAmountError}
                    />
                ) : (
                    // Landing page : connect wallet or enter address
                    <div>
                        {!manualEntry ? (
                            <ConnectWallet
                                onConnect={async () => {
                                    await connectWallet();
                                }}
                                onManual={() => setManualEntry(true)}
                            />
                        ) : (
                            <ManualWalletEntry
                                onManualConnect={handleManualConnect}
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;
