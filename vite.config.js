import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ["faucet.testnet.alpenlabs.io"]
  }
});

