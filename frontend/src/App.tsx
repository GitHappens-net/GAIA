import { useState } from "react";
import { useNodes } from "./useDevices";
import NodeCard from "./components/NodeCard";
import { RefreshCcw, MapPin } from "lucide-react";

export default function App() {
  const { nodes, setNodes, loading, error, refresh } = useNodes();
  const [expandedNodeId, setExpandedNodeId] = useState<number | null>(null);

  function handleUpdate(node_id: number, sprinkler_status: boolean) {
    setNodes((prev) =>
      prev.map((n) => (n.node_id === node_id ? { ...n, sprinkler_status } : n))
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3E1] text-[#41431B] max-w-md mx-auto flex flex-col relative shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#AEB784] px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/icon_new_full.png" alt="Gaia" className="h-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
          <h1 className="text-white font-bold text-xl tracking-tight">Gaia</h1>
        </div>
        <button
          onClick={refresh}
          className="text-[#F8F3E1] hover:text-white transition-transform active:scale-95 cursor-pointer"
          title="Refresh"
        ><RefreshCcw size={22} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-5 space-y-4 flex flex-col pb-10">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-2xl font-bold text-[#41431B]">Field Map</h2>
            <p className="text-sm text-gray-500">Tap a node to view details</p>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Irrigation</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>Normal</span>
          </div>
        </div>

        {loading && nodes.length === 0 && (
          <div className="flex justify-center flex-col gap-3 items-center mt-20">
            <RefreshCcw className="animate-spin text-[#AEB784]" size={32} />
            <p className="text-[#AEB784] font-medium animate-pulse">Scanning field...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm shadow-sm">
            {error}
          </div>
        )}

        {!loading && nodes.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center mt-20 text-center text-gray-500 space-y-3">
             <MapPin size={48} className="text-gray-300" />
             <p>No nodes reporting yet in this field.</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 auto-rows-max">
          {nodes.map((node) => (
             <NodeCard 
               key={node.node_id} 
               node={node} 
               onUpdate={handleUpdate} 
               isExpanded={expandedNodeId === node.node_id}
               onToggle={() => setExpandedNodeId(prev => prev === node.node_id ? null : node.node_id)}
             />
          ))}
        </div>
      </main>
    </div>
  );
}


