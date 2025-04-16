import { WindowStatus } from "@/helpers/uptimeHelpers";

export default function UptimeGraph({ uptime }: { uptime: WindowStatus[] }) {
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
            className={`flex-1 h-full ${status === 'up'
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