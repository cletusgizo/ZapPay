"use client";

import { useState } from "react";
import { swapToUSDC } from '/home/gizzo/Documents/ZapPay/client/lib/autoswap';

export default function SwapButton() {
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    setLoading(true);
    try {
      // Example: swap 1 STRK (in wei)
      const amount = "1000000000000000000"; // 1 token
      await swapToUSDC(amount, "STRK");
      alert("Swap successful ✅");
    } catch (err) {
      alert("Swap failed ❌ Check console");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleSwap}
      disabled={loading}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
    >
      {loading ? "Swapping..." : "Swap STRK → USDC"}
    </button>
  );
}