import styles from "../styles/ConnectWallet.module.css";

interface ConnectWalletProps {
  onConnect: () => void;
  onManual: () => void;
}

const ConnectWallet = ({ onConnect, onManual }: ConnectWalletProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.title}>Get test BTC</div>
        <button className={styles.connectButton} onClick={onConnect}>
          Connect wallet
        </button>
        <p className={styles.manualEntryLink} onClick={onManual}>
          or enter address
        </p>
      </div>
    </div>
  );
};

export default ConnectWallet;
