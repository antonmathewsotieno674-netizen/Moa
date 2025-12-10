import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Loader2, Sparkles } from 'lucide-react';
import { Message } from '../types';

interface ConsoleProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export const Console: React.FC<ConsoleProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2 bg-zinc-900/50 backdrop-blur-sm">
        <Terminal className="w-5 h-5 text-emerald-500" />
        <h2 className="font-semibold text-zinc-100 tracking-tight">MOA Console</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center mt-20 text-zinc-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
            <p className="font-medium text-zinc-400">Describe a game to begin.</p>
            <div className="text-sm mt-4 space-y-2 opacity-70">
               <p className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">"Create a physics sandbox with draggable crates"</p>
               <p className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">"Build a car with working suspension and hinges"</p>
               <p className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">"Platformer game with camera zoom and pan"</p>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
              }`}
            >
              {msg.content}
            </div>
            <span className="text-[10px] text-zinc-600 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 border border-zinc-700 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
              <span className="text-sm text-zinc-400">Generating physics engine code...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe game logic (e.g., 'Add gravity')"
            disabled={isLoading}
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};