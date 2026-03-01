import { useState } from "react";
import { useNodes } from "./useDevices";
import NodeCard from "./components/NodeCard";
import NodeDetails from "./components/NodeDetails";
import { RefreshCcw, MapPin } from "lucide-react";

export default function App() {
  const { nodes, setNodes, loading, error, refresh } = useNodes();
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  const displayNode = selectedNodeId !== null
    ? nodes.find(n => n.node_id === selectedNodeId) || null
    : null;

  function handleUpdate(node_id: number, sprinkler_status: boolean) {
    setNodes((prev) =>
      prev.map((n) => (n.node_id === node_id ? { ...n, sprinkler_status } : n))
    );
  }

  const isPanelOpen = selectedNodeId !== null;

  return (
    <div className="min-h-screen bg-[#F8F3E1] text-[#41431B] max-w-md mx-auto flex flex-col relative shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#AEB784] px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-[#F8F3E1] font-semibold text-2xl font-[Inter] mt-1">Gaia System</h1>
        </div>
        <button
          onClick={refresh}
          className={`text-[#F8F3E1] hover:text-white transition-opacity active:scale-95 mr-2 cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          title="Refresh"
        >
          <RefreshCcw size={26} className={loading && isPanelOpen === false ? "animate-spin" : ""} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pt-6 pb-2 space-y-4 flex flex-col relative z-0">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-3xl font-light text-[#41431B]">Field Map</h2>
            <p className="text-sm text-gray-500 mt-1">Tap a node to view control dashboard</p>
          </div>
        </div>

        {loading && nodes.length === 0 && (
          <div className="flex justify-center flex-col gap-3 items-center mt-20">
            <RefreshCcw className="animate-spin text-[#AEB784]" size={36} />
            <p className="text-[#AEB784] font-medium animate-pulse">Scanning field...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {!loading && nodes.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center mt-20 text-center text-gray-400 space-y-4">
             <MapPin size={56} className="text-[#dcd3ad]" />
             <p className="font-medium text-lg text-gray-500">No nodes reporting yet.</p>
          </div>
        )}

        {/* Nodes Grid */}
        <div className="grid grid-cols-3 gap-2 bg-[#EDE8D4] rounded-2xl p-2 mt-2">
          {nodes.map((node) => (
             <NodeCard 
               key={node.node_id} 
               node={node} 
               isSelected={selectedNodeId === node.node_id}
               onClick={() => setSelectedNodeId(prev => prev === node.node_id ? null : node.node_id)}
             />
          ))}
        </div>
      </main>

      {/* Slide-Up Overlay Details Panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isPanelOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <div className="max-w-md mx-auto">
          <div className="bg-[#DCD3AD] backdrop-blur-xl rounded-t-[2.5rem] pt-3 pb-8 px-2 shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.1)] border-t border-[#f4eed5] min-h-[460px]">
            {/* Grab handle stylistic */}
            <div className="w-16 h-1.5 bg-[#8e9668] rounded-full mx-auto mb-4 opacity-70"></div>
            
            <div className="-mt-3 flex-1 h-full">
               <NodeDetails
                 node={displayNode}
                 onUpdate={handleUpdate}
                 onClose={() => setSelectedNodeId(null)}
               />
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for the panel */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-500 backdrop-blur-[2px] ${
          isPanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSelectedNodeId(null)}
      ></div>

    </div>
  );
}
