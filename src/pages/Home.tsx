import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import WalletInfo from "../components/WalletInfo";
import ConnectWallet from "../components/ConnectWallet";
import ManualWalletEntry from "../components/ManualWalletEntry";
import ClaimTokens from "../components/ClaimTokens";
import { useWallet } from "../providers/WalletProvider";
import { useFaucetApi } from "../utils/api";
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
    const [faucetBalanceLow, setFaucetBalanceLow] = useState(false);
    const { getClaimAmount, getFaucetBalance } = useFaucetApi();

    // Fetch claim amount on load
    useEffect(() => {
        async function fetchBalanceAndClaim() {
            try {
                const claimRes: FaucetResult<number> = await getClaimAmount("l2");
                if (claimRes.ok) {
                    const satsToClaim = claimRes.data;
                    const btc = satsToClaim / 100_000_000;
                    setClaimAmount(btc.toFixed(2));
                    setClaimAmountError(false);

                    // Fetch balance only after claim amount is known
                    const balanceRes: FaucetResult<number> = await getFaucetBalance("l2");
                    if (balanceRes.ok) {
                        const balanceSats = balanceRes.data;
                        setFaucetBalanceLow(balanceSats < satsToClaim);
                    } else {
                        console.error("Failed to fetch faucet balance:", balanceRes.error);
                        setFaucetBalanceLow(true);
                    }
                } else {
                    console.error("Failed to fetch claim amount:", claimRes.error);
                    setClaimAmount(null);
                    setClaimAmountError(true);
                    setFaucetBalanceLow(true);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setClaimAmountError(true);
                setFaucetBalanceLow(true);
            } finally {
                setFetchingClaimAmount(false);
            }
        }

        fetchBalanceAndClaim();
    }, []);

    // Set connection status when wallet changes
    useEffect(() => {
        if (walletAddress && isOnAlpenTestnet && !manualEntry) {
            setWalletConnected(true);
        } else {
            setWalletConnected(false);
        }
    }, [walletAddress, manualEntry, isOnAlpenTestnet]);

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
                {/* Faucet balance is low */}
                {faucetBalanceLow || fetchingClaimAmount ? (
                    <div className="box">
                        <div className="faucetErrorText">
                            <span>The faucet is running</span>
                            <span>low on Test BTC.</span>
                        </div>
                        <div className="faucetErrorText">
                            <span>Please come back and</span>
                            <span>try again later.</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Wrong network. Need to switch to Alpen Testnet */}
                        {walletAddress && !manualEntry && !isOnAlpenTestnet && (
                            <div className="networkErrorContainer">
                                <div className="networkErrorBox">
                                    <span className="networkErrorTitle">
                                        Wrong network
                                    </span>
                                    <p className="networkErrorText">
                                        Your wallet is connected to the wrong network.
                                        Please switch your wallet to use the Alpen
                                        Testnet network.
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
                            <div className="box">
                                <ClaimTokens
                                    walletAddress={walletAddress!}
                                    manualEntry={manualEntry}
                                    claimAmount={claimAmount}
                                    claimAmountError={claimAmountError}
                                    onManualEntryReset={handleDisconnect}
                                />
                            </div>
                        ) : (
                            // Landing page : connect wallet or enter address
                            <div>
                                {!manualEntry ? (
                                    <div className="box">
                                        <ConnectWallet
                                            onConnect={async () => {
                                                await connectWallet();
                                            }}
                                            onManual={() => setManualEntry(true)}
                                        />
                                    </div>
                                ) : (
                                    <div className="box">
                                        <ManualWalletEntry
                                            onManualConnect={handleManualConnect}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default Home;
