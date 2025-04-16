import React from 'react';
import WebsiteCard from '@/components/dashboard/website-card';
import { useWebsites } from '@/hooks/useWebsites';

const App: React.FC = () => {
  const { websites } = useWebsites();

  return (
    <div className="p-8">
      <div className="space-y-4">
        {websites.map((website) => (
          <WebsiteCard key={website.id} website={website} />
        ))}
      </div>
    </div>
  );
};

export default App;
