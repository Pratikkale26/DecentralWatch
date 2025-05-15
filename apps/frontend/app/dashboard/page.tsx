"use client";
import React, { useState } from 'react';
import { Globe, Plus } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';
import { useAuth } from '@clerk/nextjs';
import { WebsiteCard } from './components/WebsiteCard';
import { AddWebsiteModal } from './components/AddWebsiteModal';
import { SolanaStatus } from './components/SolanaStatus';

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { websites, refreshWebsites } = useWebsites();
  const { getToken } = useAuth();

  const handleAddWebsite = async ({ url, txSignature }: { name: string; url: string; txSignature: string }) => {
    const token = await getToken();
    try {
      await axios.post(`${API_BACKEND_URL}/api/v1/website`, {
        url: url,
        signature: txSignature
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      setIsModalOpen(false);
      refreshWebsites();
    } catch (error) {
      console.error('Error adding website:', error);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-black">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DecentralWatch</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-black"
          >
            <Plus className="w-5 h-5" />
            Add Website
          </button>
        </div>

        <SolanaStatus className="mb-6" />

        <div className="space-y-4">
          {websites.map((website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              onDelete={refreshWebsites}
            />
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
