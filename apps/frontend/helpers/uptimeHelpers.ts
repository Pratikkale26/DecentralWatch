export type WindowStatus = 'up' | 'down' | 'unknown';

// Helper function to aggregate ticks into 3-minute windows
export function aggregateTicksToWindows(ticks: { createdAt: string; status: string }[], windowCount: number = 10) {
  const now = new Date();
  const threeMinutesInMs = 3 * 60 * 1000;
  const windows: WindowStatus[] = [];

  for (let i = 0; i < windowCount; i++) {
    const windowEnd = new Date(now.getTime() - (i * threeMinutesInMs));
    const windowStart = new Date(windowEnd.getTime() - threeMinutesInMs);

    const windowTicks = ticks.filter(tick => {
      const tickTime = new Date(tick.createdAt);
      return tickTime >= windowStart && tickTime < windowEnd;
    });

    let windowStatus: WindowStatus = 'unknown';
    if (windowTicks.length > 0) {
      windowStatus = windowTicks.every(tick => tick.status === 'UP') ? 'up' : 'down';
    }

    windows.unshift(windowStatus);
  }

  return windows;
}

// Calculate uptime percentage based on window statuses
export function calculateUptimePercentage(uptimeWindows: WindowStatus[]): number {
  if (uptimeWindows.length === 0) return 0;

  const upWindows = uptimeWindows.filter(status => status === 'up').length;
  const knownStatusWindows = uptimeWindows.filter(status => status !== 'unknown').length;

  if (knownStatusWindows === 0) return 0;

  return Math.round((upWindows / knownStatusWindows) * 100);
}
