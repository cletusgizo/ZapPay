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
  wallet: (uid: string) => `sn:mainnet:wallet:${uid}`, // stores JSON {address, publicKey, privateKey, createdAt}
  address: (uid: string) => `sn:mainnet:address:${uid}`, // just the address string
};

// Wallet data interface
export interface WalletData {
  address: string;
  publicKey: string;
  privateKey: string;
  chainId: string;
  network: string;
  createdAt: string;
}

// Get existing wallet for a user ID
export function getExistingWallet(userId: string): WalletData | null {
  try {
    const walletKey = snKeys.wallet(userId);
    const existingWallet = localStorage.getItem(walletKey);
    return existingWallet ? JSON.parse(existingWallet) : null;
  } catch (error) {
    console.error("Error retrieving existing wallet:", error);
    return null;
  }
}

// Store wallet data for a user ID
export function storeWallet(userId: string, walletData: WalletData): void {
  try {
    const walletKey = snKeys.wallet(userId);
    const addressKey = snKeys.address(userId);

    // Store complete wallet data
    localStorage.setItem(walletKey, JSON.stringify(walletData));

    // Store just the address for quick access
    localStorage.setItem(addressKey, walletData.address);

    console.log(`Wallet stored for user ${userId}:`, walletData.address);
  } catch (error) {
    console.error("Error storing wallet:", error);
    throw new Error("Failed to store wallet data");
  }
}

// Get or generate wallet for a user ID (ensures one wallet per user)
export async function getOrCreateWallet(userId: string): Promise<WalletData> {
  try {
    // Check if user already has a wallet
    const existingWallet = getExistingWallet(userId);

    if (existingWallet) {
      console.log("Using existing wallet for user:", userId);
      return existingWallet;
    }

    // Generate new wallet if none exists
    console.log("Generating new wallet for user:", userId);
    const newWallet = await generateStarknetAddress();
    const walletData: WalletData = {
      ...newWallet,
      createdAt: new Date().toISOString(),
    };

    // Store the new wallet
    storeWallet(userId, walletData);

    return walletData;
  } catch (error) {
    console.error("Error getting or creating wallet:", error);
    throw new Error("Failed to get or create wallet");
  }
}

// Starknet address generation function
export async function generateStarknetAddress(): Promise<{
  address: string;
  publicKey: string;
  privateKey: string;
  chainId: string;
  network: string;
}> {
  try {
    // Import Starknet libraries
    const { ec, stark, RpcProvider, constants, hash, CallData } = await import(
      "starknet"
    );

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
      privateKey: privateKey,
      chainId: constants.StarknetChainId.SN_MAIN,
      network: "starknet",
    };
  } catch (error) {
    console.error("Error generating Starknet address:", error);
    throw new Error("Failed to generate Starknet address");
  }
}
