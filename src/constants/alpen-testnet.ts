const ALPEN_TESTNET_CHAIN_ID_DEC = 2892;
export const ALPEN_TESTNET_CHAIN_ID_HEX = `0x${ALPEN_TESTNET_CHAIN_ID_DEC.toString(16)}`;
export const ALPEN_TESTNET_CHAIN_ID_BIGINT = BigInt(ALPEN_TESTNET_CHAIN_ID_DEC);

export const ALPEN_TESTNET_PARAMS = {
  chainId: ALPEN_TESTNET_CHAIN_ID_HEX,
  chainName: "Alpen Testnet",
  nativeCurrency: {
    name: "Alpen Testnet BTC",
    symbol: "sBTC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.testnet.alpenlabs.io"],
  blockExplorerUrls: ["https://explorer.testnet.alpenlabs.io"]
};
