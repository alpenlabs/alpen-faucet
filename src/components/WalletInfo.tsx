import { useState } from "react";
import AddressBadge from "./AddressBadge";
import styles from "../styles/WalletInfo.module.css";

interface WalletInfoProps {
    address: string;
    onDisconnect: () => void;
}

const WalletInfo = ({ address, onDisconnect }: WalletInfoProps) => {
    const [copied, setCopied] = useState(false);

    return (
        <div className={styles.walletWrapper}>
            <AddressBadge
                address={address}
                onCopy={() => setCopied(true)}
                onDisconnect={onDisconnect}
            />
            {copied && (
                <div className={styles.copyMessage}>Address copied!</div>
            )}
        </div>
    );
};

export default WalletInfo;
