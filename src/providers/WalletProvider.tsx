import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
} from "react";
import { ethers } from "ethers";
import {
    ALPEN_TESTNET_CHAIN_ID_HEX,
    ALPEN_TESTNET_CHAIN_ID_BIGINT,
    ALPEN_TESTNET_PARAMS,
} from "../constants/alpen-testnet";

interface WalletContextType {
    walletAddress: string | null;
    connectWallet: () => Promise<void>;
    connectManual: (address: string) => void;
    disconnectWallet: () => void;
    isOnAlpenTestnet: boolean;
    switchToAlpenTestnet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
    children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isOnAlpenTestnet, setIsOnAlpenTestnet] = useState(false);
    let ethProvider: ethers.BrowserProvider | null = null;

    const checkNetwork = async (ethProvider: ethers.BrowserProvider | null) => {
        if (!ethProvider) {
            console.error("No EVM-compatible wallet detected.");
            return;
        }
        const network = await ethProvider.getNetwork();
        setIsOnAlpenTestnet(network.chainId === ALPEN_TESTNET_CHAIN_ID_BIGINT);
    };

    const initializeProvider = (): ethers.BrowserProvider | null => {
        if (typeof window === "undefined" || !window.ethereum) {
            console.error("No EVM-compatible wallet detected.");
            return null;
        }

        ethProvider = new ethers.BrowserProvider(window.ethereum, "any");
        return ethProvider;
    }

    useEffect(() => {
        if (typeof window === "undefined" || !window.ethereum || !ethProvider) {
            return;
        }

        if (!ethProvider) {
            ethProvider = initializeProvider();
            if (!ethProvider) {
                alert("No EVM-compatible wallet detected.");
                return;
            }
        }

        checkNetwork(ethProvider);

        ethProvider.on("network", (newNetwork, oldNetwork) => {
            if (oldNetwork) {
                checkNetwork(ethProvider);
            }
        });

        window.ethereum.on?.("accountsChanged", (accounts: string[]) => {
            setWalletAddress(accounts[0] ?? null);
            checkNetwork(ethProvider);
        });

        window.ethereum.on?.("chainChanged", () => {
            if (typeof window === "undefined" || !window.ethereum) {
                alert("No EVM-compatible wallet detected.");
                return;
            }

            const newProvider = new ethers.BrowserProvider(
                window.ethereum,
                "any",
            );
            checkNetwork(ethProvider);
        });
    }, []);

    const connectWallet = async () => {
        if (!ethProvider) {
            ethProvider = initializeProvider();
            if (!ethProvider) {
                alert("No EVM-compatible wallet detected.");
                return;
            }
        }

        try {
            await ethProvider.send("eth_requestAccounts", []);
            const signer = await ethProvider.getSigner();
            const address = await signer.getAddress();
            const network = await ethProvider.getNetwork();

            setWalletAddress(address);
            setIsOnAlpenTestnet(
                network.chainId === ALPEN_TESTNET_CHAIN_ID_BIGINT,
            );
            console.log("Connected to wallet:", address);
            console.log("Network ID:", network.chainId);
        } catch (error) {
            console.error("Error connecting to wallet:", error);
            alert("Failed to connect wallet.");
        }
    };

    const connectManual = (address: string) => {
        setWalletAddress(address);
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        setIsOnAlpenTestnet(false);
    };

    const trySwitchToAlpen = async () => {
        if (typeof window === "undefined" || !window.ethereum) {
            alert("No EVM-compatible wallet detected.");
            return;
        }

        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ALPEN_TESTNET_CHAIN_ID_HEX }],
        });
    };

    const tryAddAlpenNetwork = async (): Promise<boolean> => {
        if (typeof window === "undefined" || !window.ethereum) {
            alert("No EVM-compatible wallet detected.");
            return false;
        }

        try {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [ALPEN_TESTNET_PARAMS],
            });
            return true;
        } catch (addError) {
            console.warn("Add network threw:", addError);

            // Double-check if it was actually added
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const currentNetwork = await provider.getNetwork();

                if (currentNetwork.chainId === ALPEN_TESTNET_CHAIN_ID_BIGINT) {
                    console.log("Network was added despite error");
                    return true;
                }
            } catch (networkCheckError) {
                console.error("Failed to check network", networkCheckError);
            }

            return false;
        }
    };

    const switchToAlpenTestnet = async () => {
        if (typeof window === "undefined" || !window.ethereum) {
            alert("No EVM-compatible wallet detected.");
            return;
        }
        try {
            await trySwitchToAlpen();
            setIsOnAlpenTestnet(true);
        } catch (switchError: any) {
            // Unrecognized chain ID.
            if (switchError.code === 4902) {
                const networkAdded = await tryAddAlpenNetwork();
                // After adding, try switching again
                if (networkAdded) {
                    try {
                        await trySwitchToAlpen();
                        console.log("Switched to Alpen Testnet after adding");
                        setIsOnAlpenTestnet(true);
                    } catch (switchAgainError) {
                        console.error(
                            "Failed to switch after adding",
                            switchAgainError,
                        );
                        alert(
                            "The network was added, but switching failed. Please switch manually in your wallet.",
                        );
                    }
                }
            } else {
                console.error("Failed to switch to Alpen Testnet", switchError);
                alert("You must switch to the Alpen Testnet to continue.");
            }
        }
    };

    return (
        <WalletContext.Provider
            value={{
                walletAddress,
                connectWallet,
                connectManual,
                disconnectWallet,
                isOnAlpenTestnet,
                switchToAlpenTestnet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = (): WalletContextType => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};
