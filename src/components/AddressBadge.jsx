import React, { useState } from "react";
import "../styles/index.css"; // ✅ Ensure styles are imported
import { ChevronDown } from "lucide-react"; // ✅ Dropdown arrow icon

export default function AddressBadge({ address, onDisconnect }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // ✅ Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // ✅ Copy address to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setDropdownOpen(false);
  };

  return (
    <div className="wallet-info">
      <button className="address-button" onClick={toggleDropdown}>
        {address.slice(0, 6)}...{address.slice(-4)}
        <ChevronDown className="dropdown-icon" size={16} /> {/* ✅ Dropdown arrow */}
      </button>

      {dropdownOpen && (
        <div className="dropdown-menu">
          <button onClick={handleCopy} className="dropdown-item">
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={onDisconnect} className="dropdown-item disconnect">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
