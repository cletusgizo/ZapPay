"use client";

import { useState } from "react";
import { ethers } from "ethers";
//import { swap } from "autoswap-sdk"; // if SDK exports a function

export default function Swap() {
  const [status, setStatus] = useState<string>("");

  const handleSwap = async () => {
    try {
      if (!(window as any).ethereum) {
        alert("Please install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const amountInEth = "0.01";
      const amountInWei = ethers.parseEther(amountInEth);

      setStatus("⏳ Swapping... Confirm in wallet");

     

      setStatus(`📤 Swap submitted: ${tx.hash}`);

      const receipt = await tx.wait();
      setStatus(`✅ Swap completed! Block: ${receipt.blockNumber}`);
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ Error: ${err.message || "Swap failed"}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Swap ETH → USDC</h1>

      <button
        onClick={handleSwap}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-purple-700"
      >
        Swap Now
      </button>

      {status && (
        <p className="mt-4 text-gray-700 text-sm text-center">{status}</p>
      )}
    </div>
  );
}