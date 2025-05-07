import { defineConfig } from "vite";

export default defineConfig({
    server: {
        allowedHosts: [
            "faucet.testnet.alpenlabs.io",
            "faucet.testnet-staging.stratabtc.org",
        ],
    },
});
