import React, { useState } from "react";
import { ChevronDown, Copy } from "lucide-react";
import type { WalletAddress } from "../types/faucet";
import styles from "../styles/WalletInfo.module.css";

interface AddressBadgeProps {
    address: WalletAddress;
    onCopy: () => void;
    onDisconnect: () => void;
}

const AddressBadge = ({ address, onCopy, onDisconnect }: AddressBadgeProps) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        onCopy();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.walletInfo}>
            <button className={styles.addressButton} onClick={toggleDropdown}>
                {address.slice(0, 6)}...{address.slice(-4)}
                <ChevronDown className={styles.dropdownIcon} size={16} />
            </button>

            {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                    <button
                        onClick={handleCopy}
                        className={styles.dropdownItem}
                    >
                        <Copy className={styles.dropdownIcon} />
                        <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                    <button
                        onClick={onDisconnect}
                        className={styles.dropdownItem}
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
};

export default AddressBadge;
