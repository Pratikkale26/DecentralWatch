import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as naclUtil from 'tweetnacl-util';
import { WS_URL, ValidateOutgoingMessage, ValidationStatus, validateUrl } from '../utils/validate';

const Validate = () => {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null); // WebSocket instance
  const [connected, setConnected] = useState(false);                  
  const [validatorId, setValidatorId] = useState<string | null>(null);
  const [validations, setValidations] = useState<ValidationStatus[]>([]);
  const [statusMessage, setStatusMessage] = useState('Disconnected'); 
  const [isActive, setIsActive] = useState(false);                    
  const { publicKey, signMessage } = useWallet();

  // Sign a message 
  const signMsg = useCallback(async (msg: string) => {
    if (!signMessage || !publicKey) return null;

    try {
      const messageBytes = naclUtil.decodeUTF8(msg);
      const signatureBytes = await signMessage(messageBytes); // Trigger wallet popup
      return JSON.stringify(Array.from(signatureBytes));
    } catch (err) {
      console.error('Signing failed:', err);
      return null;
    }
  }, [signMessage, publicKey]);

  // Handle Validation Request 
  const handleValidation = useCallback(async (data: ValidateOutgoingMessage) => {
    if (!websocket || !validatorId || !publicKey || !signMessage) return;

    // Set UI to "VALIDATING"
    setValidations(prev => [...prev, { url: data.url, status: 'VALIDATING', timestamp: new Date() }]);

    try {
      // Sign message (triggers wallet popup)
      const message = `Replying to ${data.callbackId}`;
      const messageBytes = naclUtil.decodeUTF8(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = JSON.stringify(Array.from(signatureBytes));

      // Perform the actual URL validation (custom fetch function)
      const { status, latency } = await validateUrl(data.url);

      // Update state with result
      setValidations(prev =>
        prev.map(v => v.url === data.url ? { ...v, status, latency, timestamp: new Date() } : v)
      );

      // Notify backend of result
      websocket.send(JSON.stringify({
        type: 'validate',
        data: {
          callbackId: data.callbackId,
          status,
          latency,
          websiteId: data.websiteId,
          validatorId,
          signedMessage: signature,
        }
      }));
    } catch (err) {
      console.error('Validation error:', err);

      // Mark as down on error
      setValidations(prev =>
        prev.map(v => v.url === data.url ? { ...v, status: 'DOWN', latency: 1000, timestamp: new Date() } : v)
      );
    }
  }, [websocket, validatorId, publicKey, signMessage]);

  // Connect Validator to WebSocket Server
  const connectToServer = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setStatusMessage('Please connect your wallet first');
      return;
    }

    const ws = new WebSocket(WS_URL);         // Create WebSocket
    const callbacks: Record<string, (data: any) => void> = {}; // Store signup callbacks

    // On connection open
    ws.onopen = async () => {
      setConnected(true);
      setStatusMessage('Connected, signing…');

      const callbackId = crypto.randomUUID(); // For verifying signup response

      // Sign message to register with server
      const signedMessage = await signMsg(`Signed message for ${callbackId}, ${publicKey.toString()}`);
      if (!signedMessage) {
        setStatusMessage('Failed to sign message');
        ws.close();
        return;
      }

      // Store callback function for signup response
      callbacks[callbackId] = data => {
        setValidatorId(data.validatorId);
        setStatusMessage(`Registered as validator ${data.validatorId}`);
        setIsActive(true);
      };

      // Send signup request
      ws.send(JSON.stringify({
        type: 'signup',
        data: {
          callbackId,
          ip: window.location.hostname,
          publicKey: publicKey.toString(),
          signedMessage
        }
      }));
    };

    // On receiving messages from server
    ws.onmessage = e => {
        try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'signup') {
            // Handle signup response
            callbacks[msg.data.callbackId]?.(msg.data);
            delete callbacks[msg.data.callbackId];
        } else if (msg.type === 'validate') {
            // Server sends a validation job
            (async () => {
            try {
                await handleValidation(msg.data);
            } catch (err) {
                console.error('Error while handling validation:', err);
            }
            })();
        }
        } catch (err) {
        console.error('Message error:', err);
        }
    };
  

    // Connection closed
    ws.onclose = () => {
      setConnected(false);
      setIsActive(false);
      setStatusMessage('Disconnected from server');
    };

    // Connection error
    ws.onerror = () => {
      setStatusMessage('Connection error');
    };

    setWebsocket(ws); // Save WebSocket instance
  }, [publicKey, signMessage, signMsg, handleValidation]);

  // Disconnect
  const disconnect = useCallback(() => {
    websocket?.close();
    setWebsocket(null);
    setConnected(false);
    setValidatorId(null);
    setIsActive(false);
    setStatusMessage('Disconnected');
  }, [websocket]);

  // Cleanup WebSocket on Unmount
  useEffect(() => () => websocket?.close(), [websocket]);


  return (
    <div className="w-full max-w-4xl bg-gray-950 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-blue-400">Validator Client</h2>

        {/* Status Block */}
        <div className="mb-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-blue-300">Status</h3>
              <p className="text-gray-300">{statusMessage}</p>
              {validatorId && <p className="text-sm text-gray-400 mt-1">Validator ID: {validatorId}</p>}
            </div>
            <div>
              {!connected ? (
                <button
                  onClick={connectToServer}
                  disabled={!publicKey}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-medium transition-colors"
                >
                  {publicKey ? 'Connect Validator' : 'Connect Wallet First'}
                </button>
              ) : (
                <button
                  onClick={disconnect}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {/* Active indicator */}
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">{isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        {/* Validation Table */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-blue-300">Recent Validations</h3>
          {validations.length === 0 ? (
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 text-center text-gray-400">
              No validations performed yet
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-800">
              <table className="w-full divide-y divide-gray-800">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Latency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {validations.map((v, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 text-sm text-gray-300 truncate max-w-xs">{v.url}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                          v.status === 'UP' ? 'bg-green-100 text-green-800' :
                          v.status === 'DOWN' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{v.latency ? `${v.latency}ms` : '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{v.timestamp.toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Validate;
