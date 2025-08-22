// client/lib/session.ts
const USER_KEY = "app:user_id";

export function getUserId() {
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    id = `user_${crypto.getRandomValues(new Uint32Array(1))[0].toString(16)}`;
    localStorage.setItem(USER_KEY, id);
  }
  return id;
}

// Namespaced keys for StarkNet mainnet
export const snKeys = {
  wallet: (uid: string) => `sn:mainnet:wallet:${uid}`, // stores JSON {address, publicKey, ...}
  address: (uid: string) => `sn:mainnet:address:${uid}`, // just the address string
};

// Starknet address generation function
export async function generateStarknetAddress(): Promise<{
  address: string;
  publicKey: string;
  chainId: string;
  network: string;
}> {
  try {
    // Import Starknet libraries
    const { ec, stark, RpcProvider, constants, hash, CallData } = await import("starknet");
    
    // Initialize the RPC provider for Starknet mainnet
    const provider = new RpcProvider({
      nodeUrl: "https://starknet-mainnet.public.blastapi.io",
    });

    // Generate a private-public key pair
    const privateKey = stark.randomAddress();
    const publicKey = ec.starkCurve.getStarkKey(privateKey);

    // OpenZeppelin account class hash (v0.8.1) for mainnet
    const OZaccountClassHash =
      "0x2c2b8f6f653f3a1c7b27c2d2d89b7953ed5426e677d2c3d0a12b2580578aa7";

    // Compile constructor calldata for OpenZeppelin account
    const OZaccountConstructorCallData = CallData.compile({
      publicKey: publicKey,
    });

    // Calculate the contract address
    const contractAddress = hash.calculateContractAddressFromHash(
      publicKey, // addressSalt
      OZaccountClassHash,
      OZaccountConstructorCallData,
      0, // deployerAddress
    );

    return {
      address: contractAddress,
      publicKey: publicKey,
      chainId: constants.StarknetChainId.SN_MAIN,
      network: "starknet",
    };
  } catch (error) {
    console.error("Error generating Starknet address:", error);
    throw new Error("Failed to generate Starknet address");
  }
}
