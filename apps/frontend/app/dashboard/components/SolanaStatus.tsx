import React, { useEffect, useState } from 'react';
import { Connection } from '@solana/web3.js';
import { Activity } from 'lucide-react';

interface SolanaStatusProps {
  className?: string;
}

const MAINNET_ENDPOINT = 'https://solana-mainnet.g.alchemy.com/v2/02RfDld8FSNkt6LNuvBQWXwejneybGP9';

export function SolanaStatus({ className = '' }: SolanaStatusProps) {
  const [status, setStatus] = useState<'up' | 'down' | 'loading'>('loading');
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connection = new Connection(MAINNET_ENDPOINT);
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const { lastValidBlockHeight } = await connection.getLatestBlockhash();
        if (!isMounted) return;
        setBlockHeight(lastValidBlockHeight);
        setStatus('up');
        setError(null);
      } catch (err: unknown) {
        if (!isMounted) return;
        setStatus('down');
        setError('Failed to connect to Solana network');
        console.error('Solana status check failed:', err instanceof Error ? err.message : err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Refresh every 60s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity
            className={`w-5 h-5 ${
              status === 'up'
                ? 'text-green-500'
                : status === 'down'
                ? 'text-red-500'
                : 'text-gray-400'
            }`}
          />
          <div>
            <h3 className="font-semibold text-gray-900">Solana Mainnet Status</h3>
            <p className="text-sm text-gray-500">
              {status === 'loading'
                ? 'Checking status...'
                : status === 'up'
                ? 'Network is operational'
                : 'Network is experiencing issues'}
            </p>
          </div>
        </div>
        {blockHeight !== null && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Latest Block Height</p>
            <p className="font-mono text-sm">{blockHeight.toLocaleString()}</p>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
