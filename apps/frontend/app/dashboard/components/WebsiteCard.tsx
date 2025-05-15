import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Power } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';
import { Website } from './types';
import { StatusCircle } from './StatusCircle';
import { UptimeGraph } from './UptimeGraph';
import { aggregateTicksToWindows, calculateUptimePercentage, isValidURL } from './utils';

interface WebsiteCardProps {
  website: Website;
  onDelete: () => void;
}

export function WebsiteCard({ website, onDelete }: WebsiteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getToken } = useAuth();
  
  const aggregatedUptime = useMemo(() => 
    website.websiteTicks ? aggregateTicksToWindows(website.websiteTicks.map(tick => ({ createdAt: tick.createdAt, status: tick.status }))) : [],
    [website.websiteTicks]
  );
  
  const uptimePercentage = useMemo(() => 
    calculateUptimePercentage(aggregatedUptime),
    [aggregatedUptime]
  );
  
  const currentStatus = aggregatedUptime.length > 0 
    ? aggregatedUptime[aggregatedUptime.length - 1] 
    : 'unknown';

  const websiteName = website.url && isValidURL(website.url) ? new URL(website.url).hostname : "Invalid URL";

  const lastCheckTime = website.websiteTicks && website.websiteTicks.length > 0 
    ? new Date(website.websiteTicks[0].createdAt).toLocaleTimeString() 
    : 'Never';

  async function handleDeleteWebsite(websiteId: string) {
    const confirmed = window.confirm("Are you sure you want to delete this website?");
    if (!confirmed) return;
    
    try {
      const token = await getToken();
  
      await axios.delete(`${API_BACKEND_URL}/api/v1/website/${websiteId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      onDelete();
    } catch (error) {
      console.error('Error deleting website:', error);
    }
  }    

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <StatusCircle status={currentStatus} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{websiteName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{website.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${
            currentStatus === 'up' ? 'text-green-600' :
            currentStatus === 'down' ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {uptimePercentage}% Uptime
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteWebsite(website.id);
            }} 
            className="text-red-500 hover:text-red-600 cursor-pointer"
            title="Disable website"
          >
            <Power size={30} />
          </button>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-300" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-zinc-700">
          <div className="mt-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Website Status</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Last check: {lastCheckTime}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 dark:bg-zinc-800 p-2 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p className={`text-sm font-medium ${
                  currentStatus === 'up' ? 'text-green-600' :
                  currentStatus === 'down' ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {currentStatus === 'up' ? 'Online' : 
                  currentStatus === 'down' ? 'Offline' : 'Unknown'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-800 p-2 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">Uptime</p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{uptimePercentage}%</p>
              </div>
              <div className="bg-gray-50 dark:bg-zinc-800 p-2 rounded">
                <p className="text-xs text-gray-500 dark:text-gray-400">Checks</p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {website.websiteTicks?.length || 0}
                </p>
              </div>
            </div>
            <UptimeGraph uptime={aggregatedUptime} />
          </div>
        </div>
      )}
    </div>
  );
} 