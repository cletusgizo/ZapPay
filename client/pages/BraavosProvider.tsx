// BraavosProvider.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface BraavosContextType {
  isConnected: boolean;
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  generateWalletAddress: (chainId?: string) => Promise<string>;
}

const BraavosContext = createContext<BraavosContextType | undefined>(undefined);

export const BraavosProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  // Check if Braavos is installed
  const isBraavosInstalled = () => {
    return typeof window !== "undefined" && window.starknet_braavos;
  };

  const connect = async () => {
    try {
      if (!isBraavosInstalled()) {
        throw new Error("Braavos wallet is not installed");
      }

      const braavos = window.starknet_braavos;

      // Request connection
      const accounts = await braavos.request({
        type: "wallet_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Failed to connect to Braavos:", error);
      throw error;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
  };

  const generateWalletAddress = async (chainId?: string): Promise<string> => {
    try {
      if (!isConnected || !account) {
        await connect();
      }

      // For StarkNet, return the connected account address
      if (chainId === "SN_MAIN" || chainId === "SN_GOERLI") {
        return account || "";
      }

      // For other chains, you might need to call specific Braavos APIs
      // This depends on Braavos's multi-chain support
      const braavos = window.starknet_braavos;

      const result = await braavos.request({
        type: "wallet_getAddress",
        params: {
          chainId: chainId || "SN_MAIN",
        },
      });

      return result.address;
    } catch (error) {
      console.error("Failed to generate wallet address:", error);
      throw error;
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isBraavosInstalled()) {
        try {
          const braavos = window.starknet_braavos;
          const accounts = await braavos.request({
            type: "wallet_getAccounts",
          });

          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          console.error("Failed to check existing connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <BraavosContext.Provider
      value={{
        isConnected,
        account,
        connect,
        disconnect,
        generateWalletAddress,
      }}
    >
      {children}
    </BraavosContext.Provider>
  );
};

export const useBraavos = () => {
  const context = useContext(BraavosContext);
  if (context === undefined) {
    throw new Error("useBraavos must be used within a BraavosProvider");
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    starknet_braavos?: any;
  }
}
