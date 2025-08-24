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
    if (!existingWallet) return null;
    
    const walletData = JSON.parse(existingWallet);
    
    // Ensure keys are properly formatted as hex strings
    if (walletData.privateKey && !walletData.privateKey.startsWith("0x")) {
      walletData.privateKey = "0x" + walletData.privateKey;
    }
    
    if (walletData.publicKey && !walletData.publicKey.startsWith("0x")) {
      walletData.publicKey = "0x" + walletData.publicKey;
    }
    
    // Ensure address is properly formatted as hex string
    if (walletData.address && !walletData.address.startsWith("0x")) {
      walletData.address = "0x" + walletData.address;
    }
    
    return walletData;
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

    // Ensure all values are properly formatted as hex strings before storing
    const formattedWalletData = { ...walletData };
    
    if (formattedWalletData.privateKey && !formattedWalletData.privateKey.startsWith("0x")) {
      formattedWalletData.privateKey = "0x" + formattedWalletData.privateKey;
    }
    
    if (formattedWalletData.publicKey && !formattedWalletData.publicKey.startsWith("0x")) {
      formattedWalletData.publicKey = "0x" + formattedWalletData.publicKey;
    }
    
    if (formattedWalletData.address && !formattedWalletData.address.startsWith("0x")) {
      formattedWalletData.address = "0x" + formattedWalletData.address;
    }

    // Store complete wallet data
    localStorage.setItem(walletKey, JSON.stringify(formattedWalletData));

    // Store just the address for quick access
    localStorage.setItem(addressKey, formattedWalletData.address);

    console.log(`Wallet stored for user ${userId}:`, formattedWalletData.address);
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
    // Ensure private key is handled as a string to maintain precision
    const privateKey = stark.randomAddress();
    const publicKey = ec.starkCurve.getStarkKey(privateKey);
    
    // Validate that the generated keys are within the Starknet curve's prime field
    // This helps catch any potential issues early
    try {
      // Ensure keys are valid field elements
      const { num } = await import("starknet");
      const privateKeyBigInt = num.toBigInt(privateKey);
      const publicKeyBigInt = num.toBigInt(publicKey);
      
      // Starknet curve prime (approximately 2^251 + 17 * 2^192)
      const STARKNET_PRIME = BigInt("3618502788666131213697322783095070105623107215331596699973092056135872020481");
      
      if (privateKeyBigInt >= STARKNET_PRIME || privateKeyBigInt <= 0n) {
        throw new Error(`Private key is outside the valid range for Starknet curve: ${privateKey}`);
      }
      
      if (publicKeyBigInt >= STARKNET_PRIME || publicKeyBigInt <= 0n) {
        throw new Error(`Public key is outside the valid range for Starknet curve: ${publicKey}`);
      }
    } catch (validationError) {
      console.error("Key validation error:", validationError);
      throw new Error("Generated keys are invalid for Starknet curve");
    }

    // OpenZeppelin account class hash (from Starknet documentation)
    const OZaccountClassHash =
      "0x540d7f5ec7ecf317e68d48564934cb99259781b1ee3cedbbc37ec5337f8e688";

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

    // Ensure all values are properly formatted as hex strings
    let formattedPrivateKey = privateKey;
    let formattedPublicKey = publicKey;
    let formattedAddress = contractAddress;
    
    if (!formattedPrivateKey.startsWith("0x")) {
      formattedPrivateKey = "0x" + formattedPrivateKey;
    }
    
    if (!formattedPublicKey.startsWith("0x")) {
      formattedPublicKey = "0x" + formattedPublicKey;
    }
    
    if (!formattedAddress.startsWith("0x")) {
      formattedAddress = "0x" + formattedAddress;
    }
    
    return {
      address: formattedAddress,
      publicKey: formattedPublicKey,
      privateKey: formattedPrivateKey,
      chainId: constants.StarknetChainId.SN_MAIN,
      network: "starknet",
    };
  } catch (error) {
    console.error("Error generating Starknet address:", error);
    throw new Error("Failed to generate Starknet address");
  }
}

// Token contract addresses
const STRK_CONTRACT =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const ETH_CONTRACT =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

// ERC20 balance reader
async function getErc20Balance(
  contractAddress: string,
  owner: string,
  provider: any
): Promise<bigint> {
  try {
    const { CallData, num } = await import("starknet");
    const res = await provider.callContract({
      contractAddress,
      entrypoint: "balanceOf",
      calldata: CallData.compile({ user: owner }),
    });
    const low = num.toBigInt(res[0]);
    const high = num.toBigInt(res[1]);
    return high * BigInt(2) ** BigInt(128) + low;
  } catch (error) {
    console.error(`Error fetching balance for ${contractAddress}:`, error);
    return BigInt(0);
  }
}

// Check if wallet has sufficient balance for deployment
async function checkWalletBalance(address: string, provider: any): Promise<boolean> {
  try {
    // Check ETH balance
    const ethBalance = await getErc20Balance(ETH_CONTRACT, address, provider);
    if (ethBalance > BigInt(0)) {
      console.log(`Wallet has ETH balance: ${ethBalance}`);
      return true;
    }
    
    // Check STRK balance
    const strkBalance = await getErc20Balance(STRK_CONTRACT, address, provider);
    if (strkBalance > BigInt(0)) {
      console.log(`Wallet has STRK balance: ${strkBalance}`);
      return true;
    }
    
    console.log("Wallet has no balance (ETH or STRK)");
    return false;
  } catch (error) {
    console.error("Error checking wallet balance:", error);
    // In case of error, we assume no balance to be safe
    return false;
  }
}

// Deploy StarkNet account contract
export async function deployStarknetAccount(walletData: WalletData): Promise<string> {
  try {
    // Import Starknet libraries
    const { Account, RpcProvider, CallData, constants, ec, stark } = await import("starknet");

    // Try different RPC providers to handle version compatibility issues
    const rpcProviders = [
      "https://starknet-mainnet.public.blastapi.io",
      "https://rpc.starknet.lava.build",
      "https://starknet-mainnet.s.chainbase.online/v1/0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    ];

    let provider;
    let lastError;

    // Try each provider until one works
    for (const rpcUrl of rpcProviders) {
      try {
        provider = new RpcProvider({
          nodeUrl: rpcUrl,
        });
        
        // Test the provider
        await provider.getChainId();
        console.log(`Successfully connected to RPC provider: ${rpcUrl}`);
        break;
      } catch (error) {
        console.log(`Failed to connect to RPC provider ${rpcUrl}:`, error);
        lastError = error;
      }
    }

    // If no provider worked, throw the last error
    if (!provider) {
      throw new Error(`Failed to connect to any RPC provider. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
    }

    // Check if wallet has any balance before attempting deployment
    const hasBalance = await checkWalletBalance(walletData.address, provider);
    if (!hasBalance) {
      throw new Error("Wallet has no balance. To deploy your account, you need to send a small amount of ETH or STRK to your address first. You can use an external wallet like Argent or Braavos to send funds to this address, then try again.");
    }

    // Validate wallet data before using it
    try {
      const { num } = await import("starknet");
      
      // Validate private key
      const privateKeyBigInt = num.toBigInt(walletData.privateKey);
      
      // Validate public key
      const publicKeyBigInt = num.toBigInt(walletData.publicKey);
      
      // Starknet curve prime (approximately 2^251 + 17 * 2^192)
      const STARKNET_PRIME = BigInt("3618502788666131213697322783095070105623107215331596699973092056135872020481");
      
      if (privateKeyBigInt >= STARKNET_PRIME || privateKeyBigInt <= 0n) {
        throw new Error(`Stored private key is outside the valid range for Starknet curve: ${walletData.privateKey}`);
      }
      
      if (publicKeyBigInt >= STARKNET_PRIME || publicKeyBigInt <= 0n) {
        throw new Error(`Stored public key is outside the valid range for Starknet curve: ${walletData.publicKey}`);
      }
    } catch (validationError) {
      console.error("Stored key validation error:", validationError);
      throw new Error("Stored keys are invalid for Starknet curve. Please generate a new wallet.");
    }
    
    // Create account instance with the private key
    const account = new Account({
      provider,
      address: walletData.address,
      signer: walletData.privateKey,
    });

    // OpenZeppelin account class hash (from Starknet documentation)
    const OZaccountClassHash =
      "0x540d7f5ec7ecf317e68d48564934cb99259781b1ee3cedbbc37ec5337f8e688";

    // Compile constructor calldata for OpenZeppelin account
    const OZaccountConstructorCallData = CallData.compile({
      publicKey: walletData.publicKey,
    });

    // Deploy the account contract
    // Log values for debugging
    console.log("Deploying account with values:");
    console.log("  classHash:", OZaccountClassHash);
    console.log("  constructorCalldata:", OZaccountConstructorCallData);
    console.log("  addressSalt (publicKey):", walletData.publicKey);
    
    // Ensure publicKey is properly formatted as a hex string
    let addressSalt = walletData.publicKey;
    if (!addressSalt.startsWith("0x")) {
      addressSalt = "0x" + addressSalt;
    }
    
    // Deploy the account contract without specifying resource bounds to avoid version compatibility issues
    const { transaction_hash } = await account.deployAccount({
      classHash: OZaccountClassHash,
      constructorCalldata: OZaccountConstructorCallData,
      addressSalt: addressSalt,
    });

    console.log("Account deployment transaction sent:", transaction_hash);

    // Wait for the transaction to be accepted
    await provider.waitForTransaction(transaction_hash, {
      retryInterval: 1000,
    });

    console.log("Account deployed successfully");
    return transaction_hash;
  } catch (error: any) {
    console.error("Error deploying Starknet account:", error);
    
    // Handle version compatibility error specifically
    if (error.message && error.message.includes("specification version is not supported")) {
      throw new Error("The StarkNet network is currently experiencing version compatibility issues. Please try again later or use an external wallet like Argent or Braavos to deploy your account by sending a small amount of ETH or STRK to your address.");
    }
    
    throw new Error(`Failed to deploy account: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
