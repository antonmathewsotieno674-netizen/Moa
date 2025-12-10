import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Loader2, Sparkles, Box, Layout, Gamepad } from 'lucide-react';
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

  const handleTemplateClick = (template: string) => {
    let prompt = "";
    if (template === 'rpg') prompt = "Create a top-down RPG with a player character (blue circle), 5 enemies (red squares) that chase the player, and a tile-based map system. Use StateComponent for health.";
    if (template === 'kanban') prompt = "Create a Kanban Board app. Columns for 'To Do', 'In Progress', 'Done'. Draggable cards with text. Use UIComponent for rendering cards.";
    if (template === 'physics') prompt = "Create a physics sandbox. A chaotic scene with 20 shapes falling, ramps, spinning obstacles (hinges), and draggable boxes. Use WASD to control a player ball.";
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2 bg-zinc-900/50 backdrop-blur-sm">
        <Terminal className="w-5 h-5 text-emerald-500" />
        <h2 className="font-semibold text-zinc-100 tracking-tight">MOA Console</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center mt-8 text-zinc-500">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
            <p className="font-medium text-zinc-400 mb-6">Select a Domain Template</p>
            
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => handleTemplateClick('rpg')}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800 transition-all group text-left"
              >
                <div className="p-2 bg-indigo-500/10 rounded-md group-hover:bg-indigo-500/20">
                  <Gamepad className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">RPG Engine</h3>
                  <p className="text-xs text-zinc-500">TileMap, State Machines, AI Chasing</p>
                </div>
              </button>

              <button 
                 onClick={() => handleTemplateClick('kanban')}
                 className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800 transition-all group text-left"
              >
                <div className="p-2 bg-emerald-500/10 rounded-md group-hover:bg-emerald-500/20">
                  <Layout className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">Kanban / App UI</h3>
                  <p className="text-xs text-zinc-500">Draggable DOM Elements, Columns</p>
                </div>
              </button>

              <button 
                 onClick={() => handleTemplateClick('physics')}
                 className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800 transition-all group text-left"
              >
                <div className="p-2 bg-orange-500/10 rounded-md group-hover:bg-orange-500/20">
                  <Box className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">Physics Sandbox</h3>
                  <p className="text-xs text-zinc-500">Matter.js, Constraints, Forces</p>
                </div>
              </button>
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
              <span className="text-sm text-zinc-400">Generating ECS Architecture...</span>
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
            placeholder="Describe app logic..."
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