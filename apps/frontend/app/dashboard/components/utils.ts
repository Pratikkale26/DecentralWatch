import { WindowStatus } from './types';

// Helper function to aggregate ticks into 3-minute windows
export function aggregateTicksToWindows(ticks: { createdAt: string; status: string }[], windowCount: number = 10) {
  const now = new Date();
  const threeMinutesInMs = 3 * 60 * 1000;
  const windows: WindowStatus[] = [];

  // Create time windows for the last 30 minutes (10 windows of 3 minutes each)
  for (let i = 0; i < windowCount; i++) {
    const windowEnd = new Date(now.getTime() - (i * threeMinutesInMs));
    const windowStart = new Date(windowEnd.getTime() - threeMinutesInMs);

    // Find ticks in this window
    const windowTicks = ticks.filter(tick => {
      const tickTime = new Date(tick.createdAt);
      return tickTime >= windowStart && tickTime < windowEnd;
    });

    // Window status logic:
    // - 'up' if all ticks in window are 'UP'
    // - 'down' if at least one tick is 'DOWN'
    // - 'unknown' if no ticks in the window
    let windowStatus: WindowStatus = 'unknown';
    
    if (windowTicks.length > 0) {
      windowStatus = windowTicks.every(tick => tick.status === 'UP') ? 'up' : 'down';
    }
    
    windows.unshift(windowStatus); // Add to start of array to show newest first
  }

  return windows;
}

// Calculate uptime percentage based on window statuses
export function calculateUptimePercentage(uptimeWindows: WindowStatus[]): number {
  if (uptimeWindows.length === 0) return 0;
  
  const upWindows = uptimeWindows.filter(status => status === 'up').length;
  const knownStatusWindows = uptimeWindows.filter(status => status !== 'unknown').length;
  
  // If all windows are unknown, return 0
  if (knownStatusWindows === 0) return 0;
  
  // Calculate percentage based only on windows with known status
  return Math.round((upWindows / knownStatusWindows) * 100);
}

// Helper function to validate URL
export function isValidURL(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
} 