import { WindowStatus } from './types';

interface UptimeGraphProps {
  uptime: WindowStatus[];
}

const statusMap = {
  up: 'Online',
  down: 'Offline',
  unknown: 'No Data',
};

export function UptimeGraph({ uptime }: UptimeGraphProps) {
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs text-gray-500">Last 30 minutes (each = 3 min)</p>
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

      <div
        className="flex w-full h-4 rounded overflow-hidden"
        role="img"
        aria-label="Uptime status over the last 30 minutes"
      >
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
            title={`${30 - index * 3} minutes ago: ${statusMap[status]}`}
          />
        ))}
      </div>

      <div className="hidden sm:flex w-full justify-between mt-1">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-[9px] text-gray-400">
            {30 - i * 3}m
          </span>
        ))}
      </div>
    </div>
  );
}
