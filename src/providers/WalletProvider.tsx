import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useRef,
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
    const ethProviderRef = useRef<ethers.BrowserProvider | null>(null);

    const initializeProvider = (): ethers.BrowserProvider | null => {
        if (typeof window === "undefined" || !window.ethereum) {
            console.error("No EVM-compatible wallet detected.");
            return null;
        }

        const provider = new ethers.BrowserProvider(window.ethereum, "any");
        ethProviderRef.current = provider;
        return provider;
    };

    const checkNetwork = async (ethProvider: ethers.BrowserProvider | null) => {
        if (!ethProvider) {
            console.error("No EVM-compatible wallet detected.");
            return;
        }
        const network = await ethProvider.getNetwork();
        setIsOnAlpenTestnet(network.chainId === ALPEN_TESTNET_CHAIN_ID_BIGINT);
    };

    // Get current accounts
    const updateAccounts = async (provider: ethers.BrowserProvider) => {
        try {
            const accounts = await provider.listAccounts();
            const newAddress = accounts.length > 0 ? accounts[0].address : null;
            setWalletAddress(newAddress);
        } catch (error) {
            console.error("Error updating accounts:", error);
            setWalletAddress(null);
        }
    };

    const handleAccountsChanged = (accounts: string[]) => {
        const newAddress = accounts.length > 0 ? accounts[0] : null;
        console.log("Setting wallet address to:", newAddress);
        setWalletAddress(newAddress);
    };

    const handleChainChanged = (_chainId: string) => {
        console.log("Chain changed, reloading provider");
        // Reinitialize provider on chain change as recommended by MetaMask
        const newProvider = initializeProvider();
        checkNetwork(newProvider);
        if (newProvider) {
            updateAccounts(newProvider);
        }
    };

    const handleNetworkChange = () => {
        checkNetwork(ethProviderRef.current);
    };


    useEffect(() => {
        if (typeof window === "undefined" || !window.ethereum) {
            console.error("window.ethereum not available");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum, "any");
        ethProviderRef.current = provider;

        // Initial network check
        checkNetwork(provider);

        // Add event listeners - safely checking for existence first
        if (window.ethereum && typeof window.ethereum.on === 'function') {
            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);
        }

        provider.on("network", handleNetworkChange)

        // Clean up event listeners on component unmount
        return () => {
            if (window.ethereum && typeof window.ethereum.removeListener === 'function') {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
                window.ethereum.removeListener("chainChanged", handleChainChanged);
            }

            if (ethProviderRef.current) {
                ethProviderRef.current.removeListener("network", handleNetworkChange);
            }
        };
    }, []);

    const connectWallet = async () => {
        let provider = ethProviderRef.current || initializeProvider();

        if (!provider) {
            alert("No EVM-compatible wallet detected.");
            return;
        }

        try {
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();

            console.log("Network ID:", network.chainId);
            setWalletAddress(address);
            if (network.chainId === ALPEN_TESTNET_CHAIN_ID_BIGINT) {
                setIsOnAlpenTestnet(true);
                console.log("Connected to wallet:", address);
            }
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
