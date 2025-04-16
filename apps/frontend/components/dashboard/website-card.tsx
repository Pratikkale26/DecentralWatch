"use client";

import { aggregateTicksToWindows, calculateUptimePercentage, WindowStatus } from '@/helpers/uptimeHelpers';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import StatusCircle from './status-circle';
import UptimeGraph from './uptime-graph';

interface Website {
  id: string;
  url: string;
  userId: string;
  disabled: boolean;
  websiteTicks: {
    id: string;
    websiteId: string;
    validatorId: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    latency: number;
  }[];
}

const WebsiteCard: React.FC<{ website: Website }> = ({ website }) => {
  const [isOpen, setIsOpen] = useState(false);

  const aggregatedUptime = useMemo(() =>
    website.websiteTicks ? aggregateTicksToWindows(website.websiteTicks.map(tick => ({ createdAt: tick.createdAt, status: tick.status }))) : [],
    [website.websiteTicks]
  );

  const uptimePercentage = useMemo(() => calculateUptimePercentage(aggregatedUptime), [aggregatedUptime]);

  const currentStatus: WindowStatus = aggregatedUptime.length > 0
    ? aggregatedUptime[aggregatedUptime.length - 1]
    : 'unknown';

  const isValidURL = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const websiteName = isValidURL(website.url) ? new URL(website.url).hostname : 'Invalid URL';
  const lastCheckTime = website.websiteTicks.length > 0 ? new Date(website.websiteTicks[0].createdAt).toLocaleTimeString() : 'Never';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-4">
          <StatusCircle status={currentStatus} />
          <div>
            <h3 className="font-semibold text-gray-900">{websiteName}</h3>
            <p className="text-sm text-gray-500">{website.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${currentStatus === 'up' ? 'text-green-600' : currentStatus === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {uptimePercentage}% Uptime
          </span>
          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-500">Website Status</p>
              <p className="text-xs text-gray-400">Last check: {lastCheckTime}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Status</p>
                <p className={`text-sm font-medium ${currentStatus === 'up' ? 'text-green-600' : currentStatus === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                  {currentStatus.toUpperCase()}
                </p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Uptime</p>
                <p className="text-sm font-medium text-gray-500">{uptimePercentage}%</p>
              </div>
            </div>
            <UptimeGraph uptime={aggregatedUptime} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteCard;
