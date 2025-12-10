import React from 'react';
import { Box, Layers, Activity, Tag, Database, Move, Eye } from 'lucide-react';
import { EntityData, ComponentData } from '../types';

interface InspectorProps {
  entities: EntityData[];
}

const ComponentIcon: React.FC<{ name: string }> = ({ name }) => {
  switch (name) {
    case 'Transform': return <Move className="w-3 h-3 text-blue-400" />;
    case 'Visual': return <Eye className="w-3 h-3 text-emerald-400" />;
    case 'Physics': return <Box className="w-3 h-3 text-orange-400" />;
    case 'Data': return <Database className="w-3 h-3 text-purple-400" />;
    default: return <Tag className="w-3 h-3 text-zinc-400" />;
  }
};

export const Inspector: React.FC<InspectorProps> = ({ entities }) => {
  if (!entities || entities.length === 0) {
    return (
      <div className="h-full w-full bg-[#0d0d0d] flex flex-col items-center justify-center text-zinc-600 space-y-3">
        <Activity className="w-10 h-10 opacity-20" />
        <p className="text-sm font-medium">No Active Entities</p>
        <p className="text-xs max-w-[200px] text-center opacity-60">The ECS World is empty or not reporting state.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#0d0d0d] text-zinc-300 border-l border-zinc-800">
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-zinc-200 tracking-wider">ECS INSPECTOR</span>
        </div>
        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
          {entities.length} Entities
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {entities.map((entity) => (
          <div key={entity.id} className="bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-zinc-900/60 border-b border-zinc-800/50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
              <span className="text-xs font-mono font-medium text-zinc-300 truncate w-full">
                {entity.id}
              </span>
            </div>
            <div className="p-2 space-y-1">
              {entity.components.map((comp, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[10px] p-1.5 rounded bg-zinc-950/30 border border-zinc-800/30 hover:border-zinc-700 transition-colors group">
                  <div className="mt-0.5"><ComponentIcon name={comp.name} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-zinc-400 mb-0.5 group-hover:text-zinc-300 transition-colors">
                      {comp.name}
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      {Object.entries(comp).map(([key, val]) => {
                         if (key === 'name') return null;
                         return (
                           <div key={key} className="flex items-center gap-1 overflow-hidden">
                             <span className="text-zinc-500">{key}:</span>
                             <span className="truncate font-mono text-zinc-300">
                               {typeof val === 'object' ? '{...}' : String(val)}
                             </span>
                           </div>
                         );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};