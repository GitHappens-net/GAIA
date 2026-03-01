import type { Node } from "../types";
import { MapPin } from "lucide-react";

interface Props {
  node: Node;
  isSelected: boolean;
  onClick: () => void;
}

const OFFLINE_THRESHOLD_MS = 60_000;

export default function NodeCard({ node, isSelected, onClick }: Props) {
  const pumpActuallyOpen = node.is_open;
  const isWarning = node.moisture < 30;
  const isOffline = false;

  return (
    <div
      onClick={onClick}
      className={`
        transition-all duration-300 ease-out cursor-pointer overflow-hidden
        rounded-2xl shadow-sm flex flex-col items-center justify-center p-2 gap-1 aspect-square relative
        ${isSelected 
          ? "bg-[#DCD3AD] border-2 border-[#AEB784] scale-95 shadow-inner" 
          : "bg-[#E3DBBB] border-2 border-transparent hover:scale-[1.03]"
        }
      `}
    >
      <div className={`transition-transform duration-300 ease-in-out ${isSelected ? "-translate-y-1 scale-110 drop-shadow-md" : ""}`}>
        <MapPin size={32} className={isOffline ? "text-gray-400" : isSelected ? "text-[#7B824B]" : "text-[#9ca571]"} fill={isOffline ? "#d1d5db" : isWarning ? "#f87171" : "#E3DBBB"} />
      </div>
      <span className="text-xs font-bold text-[#41431B] leading-tight">Node {node.node_id}</span>
      {isOffline && (
        <span className="text-[8px] font-bold uppercase tracking-wider bg-gray-600/80 text-gray-200 rounded-full px-1.5 py-0.5 leading-none">
          Offline
        </span>
      )}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-center">
        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isOffline ? 'bg-gray-400' : pumpActuallyOpen ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-gray-400'}`} title={pumpActuallyOpen ? 'Pump: Open' : 'Pump: Closed'}></div>
        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isOffline ? 'bg-gray-500' : isWarning ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)] animate-pulse' : 'bg-green-500'}`} title="Status"></div>
      </div>
    </div>
  );
}
