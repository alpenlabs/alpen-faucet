import { useState, ChangeEvent } from "react";
import { isAddress } from "ethers";
import { WalletAddress } from "../types/faucet";
import styles from "../styles/ManualWalletEntry.module.css";


interface ManualWalletEntryProps {
  onManualConnect: (address: WalletAddress) => void;
}

const ManualWalletEntry = ({ onManualConnect }: ManualWalletEntryProps) => {
  const [inputAddress, setInputAddress] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputAddress(value);
    setIsValid(isAddress(value));
  };

  const handleManualEnter = () => {
    if (isValid) {
      onManualConnect(inputAddress);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.title}>Get test BTC</div>
        <div className={styles.addressBox}>
          <input
            type="text"
            placeholder="Paste your address 0x..."
            className={`${styles.addressInput} ${inputAddress && !isValid ? styles.inputError : ""}`}
            value={inputAddress}
            onChange={handleInputChange}
          />
          {isValid === false && (
            <span className={styles.errorMessage}>
              Invalid entry. Please enter a valid address.
            </span>
          )}
          <button
            className={styles.enterButton}
            disabled={!isValid}
            onClick={handleManualEnter}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualWalletEntry;
