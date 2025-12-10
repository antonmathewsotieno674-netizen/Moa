import React from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeViewProps {
  code: string;
}

export const CodeView: React.FC<CodeViewProps> = ({ code }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) {
    return (
      <div className="h-full w-full bg-[#0d0d0d] flex items-center justify-center text-zinc-700 font-mono text-sm">
        // Generated source will appear here
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#0d0d0d] text-zinc-300">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
        <span className="text-xs font-mono text-zinc-500">index.html</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <pre className="text-sm font-mono leading-relaxed whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};