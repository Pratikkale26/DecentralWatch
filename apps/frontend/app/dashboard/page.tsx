"use client"
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Globe, Plus, X } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';
import { useAuth } from '@clerk/nextjs';

type WindowStatus = 'up' | 'down' | 'unknown';

// Helper function to aggregate ticks into 3-minute windows
function aggregateTicksToWindows(ticks: { createdAt: string; status: string }[], windowCount: number = 10) {
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
function calculateUptimePercentage(uptimeWindows: WindowStatus[]): number {
  if (uptimeWindows.length === 0) return 0;
  
  const upWindows = uptimeWindows.filter(status => status === 'up').length;
  const knownStatusWindows = uptimeWindows.filter(status => status !== 'unknown').length;
  
  // If all windows are unknown, return 0
  if (knownStatusWindows === 0) return 0;
  
  // Calculate percentage based only on windows with known status
  return Math.round((upWindows / knownStatusWindows) * 100);
}

function StatusCircle({ status }: { status: WindowStatus }) {
  return (
    <div className={`w-3 h-3 rounded-full ${
      status === 'up' 
        ? 'bg-green-500' 
        : status === 'down' 
          ? 'bg-red-500' 
          : 'bg-gray-400'
    }`} />
  );
}

function UptimeGraph({ uptime }: { uptime: WindowStatus[] }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs text-gray-500">Last 30 minutes (each segment = 3 min)</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
            <span>Up</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
            <span>Down</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
            <span>Unknown</span>
          </div>
        </div>
      </div>
      <div className="flex w-full h-4 rounded overflow-hidden">
        {uptime.map((status, index) => (
          <div
            key={index}
            className={`flex-1 h-full ${
              status === 'up' 
                ? 'bg-green-500' 
                : status === 'down' 
                  ? 'bg-red-500' 
                  : 'bg-gray-400'
            } ${index > 0 ? 'border-l border-white' : ''}`}
            title={`${(index + 1) * 3} minutes ago: ${status}`}
          />
        ))}
      </div>
      <div className="flex w-full justify-between mt-1">
        <span className="text-[9px] text-gray-400">30m</span>
        <span className="text-[9px] text-gray-400">27m</span>
        <span className="text-[9px] text-gray-400">24m</span>
        <span className="text-[9px] text-gray-400">21m</span>
        <span className="text-[9px] text-gray-400">18m</span>
        <span className="text-[9px] text-gray-400">15m</span>
        <span className="text-[9px] text-gray-400">12m</span>
        <span className="text-[9px] text-gray-400">9m</span>
        <span className="text-[9px] text-gray-400">6m</span>
        <span className="text-[9px] text-gray-400">3m</span>
      </div>
    </div>
  );
}

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

function WebsiteCard({ website }: { website: Website }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const aggregatedUptime = useMemo(() => 
    website.websiteTicks ? aggregateTicksToWindows(website.websiteTicks.map(tick => ({ createdAt: tick.createdAt, status: tick.status }))) : [],
    [website.websiteTicks]
  );
  
  // Calculate uptime percentage
  const uptimePercentage = useMemo(() => 
    calculateUptimePercentage(aggregatedUptime),
    [aggregatedUptime]
  );
  
  // Consider a website 'up' if the most recent window is up
  const currentStatus: WindowStatus = aggregatedUptime.length > 0 
    ? aggregatedUptime[aggregatedUptime.length - 1] 
    : 'unknown';

  // Helper function to validate URL
  const isValidURL = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  // Extract domain name for display
  const websiteName = website.url && isValidURL(website.url) ? new URL(website.url).hostname : "Invalid URL";

  // Get the last check time
  const lastCheckTime = website.websiteTicks && website.websiteTicks.length > 0 
    ? new Date(website.websiteTicks[0].createdAt).toLocaleTimeString() 
    : 'Never';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <StatusCircle status={currentStatus} />
          <div>
            <h3 className="font-semibold text-gray-900">{websiteName}</h3>
            <p className="text-sm text-gray-500">{website.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${
            currentStatus === 'up' ? 'text-green-600' : 
            currentStatus === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {uptimePercentage}% Uptime
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
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
                <p className={`text-sm font-medium ${
                  currentStatus === 'up' ? 'text-green-600' : 
                  currentStatus === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {currentStatus === 'up' ? 'Online' : 
                   currentStatus === 'down' ? 'Offline' : 'Unknown'}
                </p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Uptime</p>
                <p className="text-sm font-medium text-blue-600">{uptimePercentage}%</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Checks</p>
                <p className="text-sm font-medium text-blue-600">{website.websiteTicks?.length || 0}</p>
              </div>
            </div>
            <UptimeGraph uptime={aggregatedUptime} />
          </div>
        </div>
      )}
    </div>
  );
}

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (website: { name: string; url: string }) => void;
}

function AddWebsiteModal({ isOpen, onClose, onAdd }: AddWebsiteModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, url });
    setName('');
    setUrl('');
    onClose();
  };

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
              <button onClick={handleSubmit}
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Website
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {websites, refreshWebsites} = useWebsites();
  const {getToken} = useAuth();

  const handleAddWebsite = async ({ url }: { name: string; url: string }) => {
    const token = await getToken();
    axios.post(`${API_BACKEND_URL}/api/v1/website`, {
      url
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      setIsModalOpen(false);
      refreshWebsites();
    })
    .catch((error) => {
      console.error('Error adding website:', error);
    });

    console.log('Adding website:', url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">DecentralWatch</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-5 h-5" />
            Add Website
          </button>
        </div>
        
        <div className="space-y-4">
          {websites.map((website) => (
            <WebsiteCard key={website.id} website={website} />
          ))}
        </div>
      </div>

      <AddWebsiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWebsite}
      />
    </div>
  );
}

export default App;