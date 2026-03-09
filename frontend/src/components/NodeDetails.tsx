import { useState } from "react";
import type { Node } from "../types";
import { setSprinkler } from "../api";
import { Droplets, Thermometer, Wind, Sprout, Power, WifiOff } from "lucide-react";

interface Props {
  node: Node | null;
  onUpdate: (node_id: number, sprinkler_status: boolean) => void;
  onClose: () => void;
}

export default function NodeDetails({ node, onUpdate }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleToggleSprinkler() {
    if (!node) return;
    setBusy(true);
    try {
      await setSprinkler(node.node_id, !node.sprinkler_status);
      onUpdate(node.node_id, !node.sprinkler_status);
    } finally {
      setBusy(false);
    }
  }

  if (!node) return null;

  const pumpOn = node.sprinkler_status;
  const isWarning = node.moisture < 10;
  const isOffline = false;

  return (
    <div className="p-5 relative w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-5 relative">
        <h3 className="text-xl font-bold text-[#41431B] flex items-center gap-2">
           Node {node.node_id} Details
        </h3>
        {isOffline && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-200 rounded-full px-3 py-1">
            <WifiOff size={13} /> Offline
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 flex-1 overflow-y-auto pr-1">
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

      <button
        onClick={handleToggleSprinkler}
        disabled={busy || isOffline}
        className={`
          relative overflow-hidden w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-lg font-bold
          transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md
          ${isOffline
            ? "bg-gray-400 text-white"
            : pumpOn
              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              : "bg-[#AEB784] hover:bg-[#9ca571] text-white"}
        `}
      >
        <span className={`absolute bg-white/20 rounded-full w-20 h-20 blur-xl transition-all duration-500 ease-out ${pumpOn ? "scale-150 opacity-100" : "scale-50 opacity-0"}`}></span>
        <Power size={22} className={`transition-transform duration-300 ${busy ? "animate-pulse" : ""} ${pumpOn && !isOffline ? "text-blue-200" : ""}`} />
        <span className="relative z-10">{isOffline ? "Node Offline" : pumpOn ? "Irrigation Active" : "Start Irrigation"}</span>
      </button>
    </div>
  );
}

function Stat({ icon, label, value, highlight = false }: { icon: React.ReactNode, label: string; value: string, highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-3 bg-[#F8F3E1] rounded-2xl p-3 shadow-sm border transition-colors ${highlight ? "border-red-300 bg-red-50/50" : "border-[#e8dfc3]"}`}>
      <div className={`${highlight ? 'text-red-500' : 'text-[#6c7031]'}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</span>
        <span className={`text-base font-bold transition-all duration-300 ${highlight ? 'text-red-600 scale-105' : 'text-[#41431B]'}`}>{value}</span>
      </div>
    </div>
  );
}
