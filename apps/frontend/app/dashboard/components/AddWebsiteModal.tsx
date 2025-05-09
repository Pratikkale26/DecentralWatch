import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { AddWebsiteModalProps } from './types';

export function AddWebsiteModal({ isOpen, onClose, onAdd }: AddWebsiteModalProps) {
  const [url, setUrl] = useState('');
  const [txSignature, setTxSignature] = useState("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [waiting, setWaiting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name: '', url, txSignature });
    setUrl('');
    setTxSignature("");
    onClose();
  };

  async function makePayment() {
    if (!publicKey) return alert("Wallet not connected");
  
    setWaiting(true);
  
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("7m6ah1RGoYzLD65FHGbyXJffP9hPEZzh6e6HmAzGpVt9"),
          lamports: 100_000_000,
        })
      );
  
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();
  
      const signature = await sendTransaction(transaction, connection, {
        minContextSlot,
      });
  
      console.log("Transaction signature:", signature);
  
      const confirmation = await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature,
        },
        "finalized"
      );
  
      if (confirmation.value.err) {
        console.error("Transaction failed:", confirmation.value.err);
        alert("Transaction failed, please try again.");
        setWaiting(false);
        return;
      }
  
      setTxSignature(signature);
      console.log("Transaction confirmed:", signature);
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setWaiting(false);
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Website</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button 
              onClick={txSignature && !waiting ? handleSubmit : makePayment}
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {waiting ? "Processing..." : txSignature ? "Add Website" : "Pay 0.1 SOL"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 