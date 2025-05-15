import styles from "../styles/ConnectWallet.module.css";

interface ConnectWalletProps {
    onConnect: () => void;
    onManual: () => void;
}

const ConnectWallet = ({ onConnect, onManual }: ConnectWalletProps) => {
    return (
        <>
            <div className={styles.title}>
                <span>Get test BTC</span>
                <span>for Alpen Testnet</span>
            </div>
            <button className={styles.connectButton} onClick={onConnect}>
                Connect wallet
            </button>
            <p className={styles.manualEntryLink} onClick={onManual}>
                or enter address
            </p>
        </>
    );
};

export default ConnectWallet;
