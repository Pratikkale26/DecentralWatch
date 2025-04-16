import { WindowStatus } from "@/helpers/uptimeHelpers";

export default function StatusCircle({ status }: { status: WindowStatus }) {
  return (
    <div className={`w-3 h-3 rounded-full ${status === 'up'
      ? 'bg-green-500'
      : status === 'down'
        ? 'bg-red-500'
        : 'bg-gray-400'
      }`} />
  );
}