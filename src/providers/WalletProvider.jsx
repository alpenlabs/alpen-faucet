import React, { createContext, useState, useContext, useEffect } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);

      // ✅ Listen for MetaMask account changes
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      });

      // ✅ Listen for network changes
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  // ✅ Connect Wallet via MetaMask
  const connectWallet = async () => {
    if (!provider) {
      alert("MetaMask is not installed! Please install it to continue.");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Failed to connect to MetaMask. Please try again.");
    }
  };

  // ✅ Connect Manually via Address Entry
  const connectManual = (address) => {
    setWalletAddress(address); // ✅ Set manually entered address
  };

  // ✅ Disconnect Wallet (Clears Both MetaMask & Manual Entry)
  const disconnectWallet = () => {
    setWalletAddress(null); // ✅ Clears wallet whether manual or MetaMask
  };

  return (
    <WalletContext.Provider value={{ walletAddress, connectWallet, connectManual, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
