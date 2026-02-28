import { useState } from "react";
import type { Node } from "../types";
import { setSprinkler } from "../api";
import { 
  Droplets, Thermometer, Wind, Sprout, 
  MapPin, Power
} from "lucide-react";

interface Props {
  node: Node;
  onUpdate: (node_id: number, sprinkler_status: boolean) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function NodeCard({ node, onUpdate, isExpanded, onToggle }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleToggleSprinkler(e: React.MouseEvent) {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking the button
    setBusy(true);
    try {
      await setSprinkler(node.node_id, !node.sprinkler_status);
      onUpdate(node.node_id, !node.sprinkler_status);
    } finally {
      setBusy(false);
    }
  }

  const sprinklerOn = node.sprinkler_status;
  // Let's decide a simple status based on moisture < 30 ? warning : OK
  const isWarning = node.moisture < 30;

  return (
    <div 
      className={`
        transition-all duration-300 ease-in-out cursor-pointer overflow-hidden relative
        bg-[#E3DBBB] shadow-sm flex flex-col hover:shadow-md
        ${isExpanded ? "col-span-full rounded-2xl border-2 border-[#AEB784]" : "col-span-1 rounded-xl aspect-square border-2 border-transparent"}
      `}
      onClick={onToggle}
    >
      {/* Collapsed/Header View */}
      <div className={`flex flex-col items-center justify-center p-3 w-full h-full ${isExpanded ? 'h-auto !flex-row !justify-between border-b border-[#d1c8a3] bg-[#dcd3ad]' : 'gap-1'}`}>
         {isExpanded ? (
           <div className="flex items-center gap-2 text-[#41431B] font-bold text-lg">
             <MapPin size={22} className="text-[#AEB784]" fill={isWarning ? "#f87171" : "#E3DBBB"} />
             <span>Node {node.node_id}</span>
           </div>
         ) : (
           <>
             <MapPin size={26} className="text-[#6c7031] mb-1" fill={isWarning ? "#f87171" : "#E3DBBB"} />
             <span className="text-sm font-bold text-[#41431B]">Node {node.node_id}</span>
             <div className="mt-1 flex gap-1.5 items-center">
               {/* Tiny status indicators inline */}
                <div className={`w-2.5 h-2.5 rounded-full ${sprinklerOn ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-gray-400'}`} title="Irrigation"></div>
                <div className={`w-2.5 h-2.5 rounded-full ${isWarning ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)] animate-pulse' : 'bg-green-500'}`} title="Status"></div>
             </div>
           </>
         )}
         
         {isExpanded && (
           <button
             onClick={handleToggleSprinkler}
             disabled={busy}
             className={`
               flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold
               transition-colors cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm
               ${sprinklerOn
                 ? "bg-blue-500 hover:bg-blue-600 text-white"
                 : "bg-[#AEB784] hover:bg-[#9ca571] text-white"}
             `}
           >
             <Power size={18} /> 
             {sprinklerOn ? "Watering" : "Sprinkler"}
           </button>
         )}
      </div>

      {/* Expanded Details - Grid */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-2 gap-3 bg-[#E3DBBB]">
          <Stat icon={<Thermometer size={20} />} label="Temp" value={`${node.temp.toFixed(1)}°C`} />
          <Stat icon={<Droplets size={20} />} label="Humidity" value={`${node.humidity}%`} />
          <Stat 
            icon={<Wind size={20} />} 
            label="Moisture" 
            value={`${node.moisture}%`} 
            highlight={isWarning} 
          />
          <Stat icon={<Sprout size={20} className="text-emerald-600"/>} label="Nitrogen" value={node.Nlevel.toFixed(1)} />
          <Stat icon={<Sprout size={20} className="text-teal-600"/>} label="Phosphor" value={node.Plevel.toFixed(1)} />
          <Stat icon={<Sprout size={20} className="text-cyan-600"/>} label="Potassium" value={node.Klevel.toFixed(1)} />
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, highlight = false }: { icon: React.ReactNode, label: string; value: string, highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-3 bg-[#F8F3E1] rounded-xl p-3 shadow-sm border ${highlight ? 'border-red-300 bg-red-50/50' : 'border-[#e8dfc3]'}`}>
      <div className={`${highlight ? 'text-red-500' : 'text-[#6c7031]'}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</span>
        <span className={`text-base font-bold ${highlight ? 'text-red-600' : 'text-[#41431B]'}`}>{value}</span>
      </div>
    </div>
  );
}
