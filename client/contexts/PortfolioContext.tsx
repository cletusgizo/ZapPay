import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { getUserId, getExistingWallet } from "../lib/session";
import { RpcProvider, CallData, num } from "starknet";
import { autoSwapStrkBalance } from "../lib/autoswap";

// Token contracts
const STRK_CONTRACT =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const ETH_CONTRACT =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const USDC_CONTRACT =
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

// Exchange rates (NGN)
const EXCHANGE_RATES = {
  eth: 1700000,
  strk: 60,
  usdc: 750,
};

// StarkNet RPC provider
const STARKNET_MAINNET_RPC = "https://starknet-mainnet.public.blastapi.io/";
const provider = new RpcProvider({ nodeUrl: STARKNET_MAINNET_RPC });

interface AssetBalance {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  nairaValue: string;
  usdValue: string;
  change24h: string;
  isPositive: boolean;
  icon: string;
  contractAddress?: string;
  decimals: number;
  isLoading?: boolean;
  error?: string;
}

interface PortfolioContextType {
  totalBalance: number;
  assets: AssetBalance[];
  loading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  isAutoSwapping: boolean;
  autoSwapError: string | null;
  triggerAutoSwap: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// ERC20 balance reader
async function getErc20Balance(
  contractAddress: string,
  owner: string,
): Promise<bigint> {
  try {
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
    throw error;
  }
}

// Get wallet address from session
function getWalletAddress(): string | null {
  try {
    const userId = getUserId();
    const existingWallet = getExistingWallet(userId);
    return existingWallet ? existingWallet.address : null;
  } catch {
    return null;
  }
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [totalBalance, setTotalBalance] = useState(0);
  const [assets, setAssets] = useState<AssetBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoSwapping, setIsAutoSwapping] = useState(false);
  const [autoSwapError, setAutoSwapError] = useState<string | null>(null);
  const previousStrkBalance = useRef<bigint | null>(null);

  const fetchBalances = async () => {
    setLoading(true);
    setError(null);
    setAutoSwapError(null);
    
    try {
      const address = getWalletAddress();
      if (!address) {
        setTotalBalance(0);
        setAssets([]);
        setLoading(false);
        return;
      }

      // Define assets
      const assetList: AssetBalance[] = [
        {
          id: "eth",
          name: "Ethereum",
          symbol: "ETH",
          amount: "0",
          nairaValue: "₦0",
          usdValue: "$0.00",
          change24h: "+5.2%",
          isPositive: true,
          icon: "🔷",
          contractAddress: ETH_CONTRACT,
          decimals: 18,
        },
        {
          id: "strk",
          name: "StarkNet",
          symbol: "STRK",
          amount: "0",
          nairaValue: "₦0",
          usdValue: "$0.00",
          change24h: "-2.1%",
          isPositive: false,
          icon: "⭐",
          contractAddress: STRK_CONTRACT,
          decimals: 18,
        },
        {
          id: "usdc",
          name: "USD Coin",
          symbol: "USDC",
          amount: "0",
          nairaValue: "₦0",
          usdValue: "$0.00",
          change24h: "+0.1%",
          isPositive: true,
          icon: "💵",
          contractAddress: USDC_CONTRACT,
          decimals: 6,
        },
      ];

      // Fetch balances for each asset
      const updatedAssets = await Promise.all(
        assetList.map(async (asset) => {
          try {
            if (asset.contractAddress) {
              const balance = await getErc20Balance(asset.contractAddress, address);
              const balanceNum = Number(balance) / Math.pow(10, asset.decimals);
              const nairaValueNum =
                balanceNum *
                EXCHANGE_RATES[asset.id as keyof typeof EXCHANGE_RATES];
              const usdValue = nairaValueNum / 750;
              
              // Check if this is the STRK asset and if balance has increased
              if (asset.id === "strk" && !isAutoSwapping) {
                console.log("Checking STRK balance - previous:", previousStrkBalance.current, "current:", balance);
                
                // If this is the first time checking, just store the balance
                if (previousStrkBalance.current === null) {
                  previousStrkBalance.current = balance;
                  console.log("Stored initial STRK balance:", balance);
                }
                // If balance has increased, trigger auto-swap
                else if (balance > previousStrkBalance.current) {
                  console.log("STRK balance increased, triggering auto-swap");
                  console.log("Balance difference:", balance - previousStrkBalance.current);
                  triggerAutoSwap();
                } else if (balance < previousStrkBalance.current) {
                  console.log("STRK balance decreased");
                } else {
                  console.log("STRK balance unchanged");
                }
                
                // Update the previous balance
                previousStrkBalance.current = balance;
              }
              
              return {
                ...asset,
                amount: balanceNum.toLocaleString(undefined, {
                  minimumFractionDigits: asset.decimals === 6 ? 2 : 6,
                  maximumFractionDigits: asset.decimals === 6 ? 2 : 6,
                }),
                nairaValue: `₦${nairaValueNum.toLocaleString()}`,
                usdValue: `$${usdValue.toFixed(2)}`,
                isLoading: false,
                error: undefined,
              };
            }
            return {
              ...asset,
              isLoading: false,
              error: "No contract",
            };
          } catch (error) {
            console.error(`Error fetching balance for ${asset.symbol}:`, error);
            return {
              ...asset,
              isLoading: false,
              error: "Failed",
            };
          }
        })
      );

      
            // Calculate total balance
            const total = updatedAssets.reduce((sum, asset) => {
              const nairaValue = parseFloat(asset.nairaValue.replace(/[₦,]/g, ""));
              return sum + (isNaN(nairaValue) ? 0 : nairaValue);
            }, 0);
            
            setAssets(updatedAssets);
            setTotalBalance(total);
          } catch (err) {
            setError("Failed to fetch portfolio data");
            console.error("Error fetching portfolio:", err);
          } finally {
            setLoading(false);
          }
        };
      
        // Set up periodic balance checking
        useEffect(() => {
          // Check balances every 30 seconds
          const intervalId = setInterval(() => {
            fetchBalances();
          }, 30000);
      
          // Clean up interval on unmount
          return () => clearInterval(intervalId);
        }, []);
  const triggerAutoSwap = async () => {
    if (isAutoSwapping) {
      console.log("Auto-swap already in progress, skipping");
      return;
    }
    
    setIsAutoSwapping(true);
    setAutoSwapError(null);
    
    try {
      console.log("Triggering auto-swap of STRK to USDC");
      const result = await autoSwapStrkBalance();
      console.log("Auto-swap result:", result);
      
      if (!result.success) {
        setAutoSwapError(result.message);
        console.error("Auto-swap failed:", result.message);
      } else {
        console.log("Auto-swap successful:", result.message);
      }
    } catch (error: any) {
      setAutoSwapError(error.message || "Auto-swap failed");
      console.error("Auto-swap error:", error);
    } finally {
      setIsAutoSwapping(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const refreshBalances = async () => {
    await fetchBalances();
  };

  return (
    <PortfolioContext.Provider
      value={{
        totalBalance,
        assets,
        loading,
        error,
        refreshBalances,
        isAutoSwapping,
        autoSwapError,
        triggerAutoSwap,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}