// client/lib/autoswap.ts
import { AutoSwappr, TOKEN_ADDRESSES } from "autoswap-sdk";

const autoswappr = new AutoSwappr({
  contractAddress: "0x5b08cbdaa6a2338e69fad7c62ce20204f1666fece27288837163c19320b9496",
  rpcUrl: "https://starknet-mainnet.public.blastapi.io",
  accountAddress: '0x01f6e243faebc2965f60017a5adbc0c7397e576ab210b8f4dcd5bae0390370c7', // from .env
  privateKey: '0x031c2a05c43a9c6f913859160c272f2e86b5c9a326e159e1acc3a82908005caf',     // from .env
});

// Swap function
export async function swapToUSDC(amountInWei: string, token: "ETH" | "STRK") {
  try {
    const tokenFrom =
      token === "ETH" ? TOKEN_ADDRESSES.ETH : TOKEN_ADDRESSES.STRK;

    const result = await autoswappr.executeSwap(
      tokenFrom,
      TOKEN_ADDRESSES.USDC,
      {
        amount: amountInWei, // e.g. 1e18 = "1000000000000000000"
        isToken1: false,
      }
    );

    console.log("Swap result:", result);
    return result;
  } catch (err) {
    console.error("Swap failed:", err);
    throw err;
  }
}