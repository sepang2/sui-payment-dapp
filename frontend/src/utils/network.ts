import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  localnet: {
    url: getFullnodeUrl("localnet"),
  },
  devnet: {
    url: getFullnodeUrl("devnet"),
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
  },
  mainnet: {
    url: getFullnodeUrl("mainnet"),
  },
});

export { useNetworkVariable, useNetworkVariables, networkConfig };
