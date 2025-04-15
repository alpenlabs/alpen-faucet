import AddressBadge from "./AddressBadge";
import styles from "../styles/Header.module.css";

interface HeaderProps {
  address?: string;
  onDisconnect?: () => void;
}

const Header = ({ address, onDisconnect }: HeaderProps) => {
  return (
    <div className={styles.header}>
      <a href="/" className={styles.logoWrapper}>
        <div className={styles.logoSvg}>
          <img src="/logo.svg" alt="ALPEN" />
        </div>
      </a>
    </div>
  );
};

export default Header;
