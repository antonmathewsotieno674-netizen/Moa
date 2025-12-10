import React, { useEffect, useRef } from 'react';
import { RefreshCw, Play } from 'lucide-react';
import { EntityData } from '../types';

interface PreviewProps {
  code: string;
  version: number;
  onStateUpdate: (entities: EntityData[]) => void;
}

export const Preview: React.FC<PreviewProps> = ({ code, version, onStateUpdate }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.srcdoc = code;
    }
  }, [code, version]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In a real env, check event.origin, but here we use sandboxed iframe
      if (event.data && event.data.type === 'MOA_ECS_UPDATE') {
        onStateUpdate(event.data.entities);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onStateUpdate]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = iframeRef.current.srcdoc; 
    }
  };

  if (!code) {
    return (
      <div className="h-full w-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-600">
        <Play className="w-16 h-16 mb-4 opacity-20" />
        <p>Awaiting Game Code...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-black">
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Live Preview</span>
        <button 
          onClick={handleRefresh}
          className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
          title="Restart Game"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          title="Game Preview"
          sandbox="allow-scripts allow-modals allow-same-origin"
          className="w-full h-full border-none bg-white"
        />
      </div>
    </div>
  );
};