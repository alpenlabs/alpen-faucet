export const ALPEN_TESTNET_CHAIN_ID = "0x3039"; // 12345 in hex
export const ALPEN_TESTNET_CHAIN_ID_BIGINT = 12345n;

export const ALPEN_TESTNET_PARAMS = {
  chainId: ALPEN_TESTNET_CHAIN_ID,
  chainName: "Alpen Testnet",
  nativeCurrency: {
    name: "Alpen Testnet BTC",
    symbol: "sBTC",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.testnet.alpenlabs.io"],
  blockExplorerUrls: ["https://explorer.testnet.alpenlabs.io"]
};
