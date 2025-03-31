"use client"
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Globe, Plus, X } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';

// Helper function to aggregate ticks into 3-minute windows
function aggregateTicksToWindows(ticks: { createdAt: string; status: string }[], windowCount: number = 10) {
  const now = new Date();
  const threeMinutesInMs = 3 * 60 * 1000;
  const windows: boolean[] = [];

  // Create time windows for the last 30 minutes (10 windows of 3 minutes each)
  for (let i = 0; i < windowCount; i++) {
    const windowEnd = new Date(now.getTime() - (i * threeMinutesInMs));
    const windowStart = new Date(windowEnd.getTime() - threeMinutesInMs);

    // Find ticks in this window
    const windowTicks = ticks.filter(tick => {
      const tickTime = new Date(tick.createdAt);
      return tickTime >= windowStart && tickTime < windowEnd;
    });

    // Window is considered 'up' if all ticks in the window are 'up'
    // If no ticks in window, consider it down
    const isWindowUp = windowTicks.length > 0 && 
      windowTicks.every(tick => tick.status === 'up');
    
    windows.unshift(isWindowUp); // Add to start of array to show newest first
  }

  return windows;
}

function StatusCircle({ status }: { status: string }) {
  return (
    <div className={`w-3 h-3 rounded-full ${status === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
  );
}

function UptimeGraph({ uptime }: { uptime: boolean[] }) {
  return (
    <div className="flex gap-1 items-center mt-4">
      {uptime.map((isUp, index) => (
        <div
          key={index}
          className={`w-8 h-2 rounded ${
            isUp ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
      ))}
    </div>
  );
}

interface Website {
  id: number;
  url: string;
  ticks: {
    id: string;
    createdAt: string;
    status: string;
    latency: number;
  }[];
}

function WebsiteCard({ website }: { website: Website }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const aggregatedUptime = useMemo(() => 
    aggregateTicksToWindows(website.ticks),
    [website.ticks]
  );

  // Consider a website 'up' if the most recent window is up
  const currentStatus = aggregatedUptime[aggregatedUptime.length - 1] ? 'up' : 'down';

  // Extract domain name for display
  const websiteName = new URL(website.url).hostname;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden ">
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
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-500">Last 30 minutes uptime (3-minute windows)</p>
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
        <form onSubmit={handleSubmit}>
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
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Website
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const websites = useWebsites();

  const handleAddWebsite = ({ url }: { name: string; url: string }) => {
    // TODO: Implement API call to add website
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