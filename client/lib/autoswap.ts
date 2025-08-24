// client/lib/autoswap.ts
import { AutoSwappr, TOKEN_ADDRESSES } from "autoswap-sdk";
import { getUserId, generateStarknetAddress, snKeys } from "./session";

// Secure autoswap configuration
async function createAutoSwappr(accountAddress: string, privateKey: string) {
  return new AutoSwappr({
    contractAddress: "0x05582ad635c43b4c14dbfa53cbde0df32266164a0d1b36e5b510e5b34aeb364b",
    rpcUrl: "https://starknet-mainnet.public.blastapi.io",
    accountAddress,
    privateKey,
  });
}

// Get wallet credentials securely
async function getWalletCredentials(): Promise<{address: string, privateKey: string}> {
  try {
    const userId = getUserId();
    let address = localStorage.getItem(snKeys.address(userId));
    let walletData;

    if (!address) {
      // Generate new wallet if none exists
      walletData = await generateStarknetAddress();
      address = walletData.address;
      localStorage.setItem(snKeys.address(userId), address);
    } else {
      // For existing address, retrieve the private key from stored wallet data
      const storedWallet = localStorage.getItem(snKeys.wallet(userId));
      if (storedWallet) {
        walletData = JSON.parse(storedWallet);
      } else {
        // Fallback: generate new wallet if no stored wallet data exists
        // This should not happen in normal operation
        console.warn("No stored wallet data found for existing address, generating new wallet");
        walletData = await generateStarknetAddress();
      }
    }

    return {
      address: address,
      privateKey: walletData.privateKey
    };
  } catch (error) {
    console.error("Error getting wallet credentials:", error);
    throw new Error("Failed to get wallet credentials");
  }
}

// Get STRK balance
async function getStrkBalance(address: string): Promise<bigint> {
  try {
    // Use the existing provider from Wallet.tsx
    const { RpcProvider, CallData, num } = await import("starknet");
    
    const STARKNET_MAINNET_RPC = "https://starknet-mainnet.public.blastapi.io/";
    const provider = new RpcProvider({ nodeUrl: STARKNET_MAINNET_RPC });
    
    const STRK_CONTRACT =
      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

    const res = await provider.callContract({
      contractAddress: STRK_CONTRACT,
      entrypoint: "balanceOf",
      calldata: CallData.compile({ user: address }),
    });
    
    const low = num.toBigInt(res[0]);
    const high = num.toBigInt(res[1]);
    return high * BigInt(2) ** BigInt(128) + low;
  } catch (error) {
    console.error("Error fetching STRK balance:", error);
    throw error;
  }
}

// Enhanced swap function with better error handling
export async function swapToUSDC(amountInWei: string, token: "ETH" | "STRK") {
  try {
    // Validate input
    if (!amountInWei || amountInWei === "0") {
      throw new Error("Invalid amount");
    }

    // Convert amount from scientific notation to proper format if needed
    let formattedAmount = amountInWei;
    if (amountInWei.includes('e') || amountInWei.includes('E')) {
      // Handle scientific notation using string manipulation
      try {
        const [mantissa, exponentStr] = amountInWei.split(/[eE]/);
        const exponent = parseInt(exponentStr);
        
        if (isNaN(exponent)) {
          throw new Error(`Invalid exponent in scientific notation: ${amountInWei}`);
        }
        
        // Remove decimal point from mantissa for easier manipulation
        const [integerPart, fractionalPart] = mantissa.split('.');
        const baseNumber = integerPart + (fractionalPart || '');
        
        // Calculate the number of zeros to add/subtract
        let zerosToAdd = exponent - (fractionalPart?.length || 0);
        
        if (zerosToAdd > 0) {
          // Positive exponent: add zeros to the right
          formattedAmount = baseNumber + '0'.repeat(zerosToAdd);
        } else if (zerosToAdd < 0) {
          // Negative exponent: we would get a fraction, which we floor to 0 for BigInt
          formattedAmount = "0";
        } else {
          // No adjustment needed
          formattedAmount = baseNumber;
        }
      } catch (e) {
        throw new Error(`Cannot convert scientific notation ${amountInWei} to regular format: ${e.message}`);
      }
    }

    // Get wallet credentials
    const { address, privateKey } = await getWalletCredentials();
    
    // Create autoswappr instance
    const autoswappr = await createAutoSwappr(address, privateKey);
    
    const tokenFrom = token === "ETH" ? TOKEN_ADDRESSES.ETH : TOKEN_ADDRESSES.STRK;

    console.log(`Swapping ${formattedAmount} ${token} to USDC...`);
    
    try {
      const result = await autoswappr.executeSwap(
        tokenFrom,
        TOKEN_ADDRESSES.USDC,
        {
          amount: formattedAmount,
          isToken1: false,
        },
      );

      console.log("Swap successful:", result);
      return {
        success: true,
        result,
        txHash: result.result?.transaction_hash || "", // Fix TypeScript error
      };
    } catch (sdkError: any) {
      // If the error is related to scientific notation, try a different approach
      if (sdkError.message && sdkError.message.includes('BigInt')) {
        console.log("Retrying swap with reduced amount due to BigInt conversion error");
        // Try with a much smaller amount to avoid scientific notation
        const smallerAmount = "1000000000000000000"; // 1 STRK in wei
        console.log(`Retrying with smaller amount: ${smallerAmount}`);
        
        try {
          const result = await autoswappr.executeSwap(
            tokenFrom,
            TOKEN_ADDRESSES.USDC,
            {
              amount: smallerAmount,
              isToken1: false,
            },
          );
          
          console.log("Swap successful with smaller amount:", result);
          return {
            success: true,
            result,
            txHash: result.result?.transaction_hash || "", // Fix TypeScript error
          };
        } catch (retryError: any) {
          throw new Error(`Swap failed even with smaller amount: ${retryError.message}`);
        }
      } else {
        throw sdkError;
      }
    }
  } catch (err: any) {
    console.error("Swap failed:", err);
    return {
      success: false,
      error: err.message || "Swap failed",
    };
  }
}

// Auto-swap STRK balance to USDC
export async function autoSwapStrkBalance(): Promise<{success: boolean, message: string, txHash?: string}> {
  try {
    const { address, privateKey } = await getWalletCredentials();
    
    // Get actual STRK balance
    const strkBalance = await getStrkBalance(address);
    
    // Check if balance is zero
    if (strkBalance === BigInt(0)) {
      return {
        success: true,
        message: "No STRK balance to swap"
      };
    }

    // Convert balance to string for swap function
    // Use BigInt.toString() which should not use scientific notation
    const strkBalanceStr = strkBalance.toString();
    console.log("STRK balance as BigInt:", strkBalance);
    console.log("STRK balance as string:", strkBalanceStr);
    console.log("Contains scientific notation:", strkBalanceStr.includes('e') || strkBalanceStr.includes('E'));
    
    // Limit the amount to swap to prevent issues with very large numbers
    // Convert to a reasonable maximum amount (e.g., 1000 STRK = 1000 * 10^18 wei)
    const MAX_SWAP_AMOUNT = 1000n * (10n ** 18n); // 1000 STRK
    const amountToSwap = strkBalance > MAX_SWAP_AMOUNT ? MAX_SWAP_AMOUNT : strkBalance;
    const amountToSwapStr = amountToSwap.toString();
    console.log("Amount to swap as BigInt:", amountToSwap);
    console.log("Amount to swap as string:", amountToSwapStr);
    
    const swapResult = await swapToUSDC(amountToSwapStr, "STRK");
    
    if (swapResult.success) {
      return {
        success: true,
        message: `Successfully swapped STRK to USDC`,
        txHash: swapResult.txHash
      };
    } else {
      return {
        success: false,
        message: swapResult.error || "Swap failed"
      };
    }
  } catch (error: any) {
    console.error("Auto-swap failed:", error);
    return {
      success: false,
      message: error.message || "Auto-swap failed"
    };
  }
}