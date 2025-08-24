// client/lib/useAutoSwap.ts
import { useState, useCallback } from "react";
import { swapToUSDC, autoSwapStrkBalance } from "./autoswap";

interface SwapState {
  isSwapping: boolean;
  swapSuccess: boolean | null;
  swapError: string | null;
  txHash: string | null;
}

export function useAutoSwap() {
  const [swapState, setSwapState] = useState<SwapState>({
    isSwapping: false,
    swapSuccess: null,
    swapError: null,
    txHash: null,
  });

  const executeSwap = useCallback(
    async (amount: string, token: "ETH" | "STRK") => {
      setSwapState({
        isSwapping: true,
        swapSuccess: null,
        swapError: null,
        txHash: null,
      });

      try {
        const result = await swapToUSDC(amount, token);

        if (result.success) {
          setSwapState({
            isSwapping: false,
            swapSuccess: true,
            swapError: null,
            txHash: result.txHash || null,
          });
        } else {
          setSwapState({
            isSwapping: false,
            swapSuccess: false,
            swapError: result.error || "Swap failed",
            txHash: null,
          });
        }
      } catch (error: any) {
        setSwapState({
          isSwapping: false,
          swapSuccess: false,
          swapError: error.message || "Swap failed",
          txHash: null,
        });
      }
    },
    [],
  );

  const executeAutoSwap = useCallback(async () => {
    setSwapState({
      isSwapping: true,
      swapSuccess: null,
      swapError: null,
      txHash: null,
    });

    try {
      const result = await autoSwapStrkBalance();

      setSwapState({
        isSwapping: false,
        swapSuccess: result.success,
        swapError: result.success ? null : result.message,
        txHash: result.txHash || null,
      });
    } catch (error: any) {
      setSwapState({
        isSwapping: false,
        swapSuccess: false,
        swapError: error.message || "Auto-swap failed",
        txHash: null,
      });
    }
  }, []);

  const resetSwapState = useCallback(() => {
    setSwapState({
      isSwapping: false,
      swapSuccess: null,
      swapError: null,
      txHash: null,
    });
  }, []);

  return {
    ...swapState,
    executeSwap,
    executeAutoSwap,
    resetSwapState,
  };
}
