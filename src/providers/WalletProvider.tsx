import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import {
  ALPEN_TESTNET_CHAIN_ID,
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
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isOnAlpenTestnet, setIsOnAlpenTestnet] = useState(false);

  const checkNetwork = async (ethProvider: ethers.BrowserProvider) => {
    const network = await ethProvider.getNetwork();
    setIsOnAlpenTestnet(network.chainId === ALPEN_TESTNET_CHAIN_ID_BIGINT);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("No EVM-compatible wallet detected.");
      return;
    }
  
    const ethProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(ethProvider);
  
    checkNetwork(ethProvider);
  
    window.ethereum.on?.("accountsChanged", (accounts: string[]) => {
      setWalletAddress(accounts[0] ?? null);
      checkNetwork(ethProvider);
    });
  
    window.ethereum.on?.("chainChanged", () => {
      if (typeof window === "undefined" || !window.ethereum) {
        alert("No EVM-compatible wallet detected.");
        return;
      }

      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
      checkNetwork(ethProvider);
    });
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      alert("No EVM-compatible wallet detected.");
      return;
    }

    try {
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setWalletAddress(address);
      setIsOnAlpenTestnet(network.chainId === ALPEN_TESTNET_CHAIN_ID_BIGINT);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      alert("Failed to connect wallet.");
    }
  };

  const connectManual = (address: string) => {
    setWalletAddress(address);
    setIsOnAlpenTestnet(true);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsOnAlpenTestnet(false);
  };


  const switchToAlpenTestnet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("No EVM-compatible wallet detected.");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ALPEN_TESTNET_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // Unrecognized chain ID.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ALPEN_TESTNET_PARAMS],
          });
        } catch (addError) {
          console.error("User rejected adding Alpen Testnet", addError);
        }

        try {
          // Switch the network
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ALPEN_TESTNET_CHAIN_ID }],
          });
        } catch (switchError) {
          console.error("Failed to switch to added network", switchError);
          alert("Failed to switch network. Please switch the network manually.");
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
