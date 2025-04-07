// WebSocket connection URL
export const WS_URL = 'ws://localhost:8081';

// Types for WebSocket messages
export type SignupOutgoingMessage = {
  validatorId: string;
  callbackId: string;
};

export type ValidateOutgoingMessage = {
  url: string;
  callbackId: string;
  websiteId: string;
};

export type ValidationStatus = {
  url: string;
  status: 'UP' | 'DOWN' | 'VALIDATING';
  latency?: number;
  timestamp: Date;
};


export const validateUrl = async (url: string): Promise<{ status: 'UP' | 'DOWN'; latency: number }> => {
  console.log(`Validating URL: ${url}`);
  const startTime = Date.now();
  
  try {
    // This will generate CORS errors in browser but works in Node/Electron, need to make the eletron app for auto signing and this cors error
    const response = await fetch(url);
    const endTime = Date.now();
    const latency = endTime - startTime;
    const status = response.status === 200 ? 'UP' : 'DOWN';
    
    console.log(`URL status: ${status}, latency: ${latency}ms`);
    return { status, latency };
  } catch (error) {
    console.error('Validation error:', error);
    return { status: 'DOWN', latency: 1000 };
  }
};