import React, { useState, useCallback } from 'react';
import { Console } from './components/Console';
import { Preview } from './components/Preview';
import { CodeView } from './components/CodeView';
import { Inspector } from './components/Inspector';
import { Message, ViewMode, GameState, EntityData } from './types';
import { generateGame } from './services/gemini';
import { Layout, Code, Monitor, Github, Gamepad2, Layers } from 'lucide-react';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [rightPanelMode, setRightPanelMode] = useState<'CODE' | 'INSPECTOR'>('INSPECTOR'); // For split view
  const [messages, setMessages] = useState<Message[]>([]);
  const [ecsEntities, setEcsEntities] = useState<EntityData[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    code: '',
    version: 0,
    isLoading: false,
    error: null,
  });

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMsg: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Set loading state
    setGameState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call Gemini API
      const generatedCode = await generateGame(content, gameState.code);

      // Update state with new code
      setGameState(prev => ({
        code: generatedCode,
        version: prev.version + 1,
        isLoading: false,
        error: null
      }));

      // Add system confirmation
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Game v${gameState.version + 1} generated successfully.`,
        timestamp: Date.now()
      }]);

    } catch (error) {
      setGameState(prev => ({ ...prev, isLoading: false, error: 'Failed to generate game.' }));
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Error: Failed to generate game code. Please try again.`,
        timestamp: Date.now()
      }]);
    }
  }, [gameState.code, gameState.version]);

  const handleEcsUpdate = useCallback((entities: EntityData[]) => {
    // Debounce or just set state - React 18 batches updates automatically usually
    setEcsEntities(entities);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 overflow-hidden text-zinc-100 font-sans">
      {/* Header */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-1.5 rounded-lg shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            MOA
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-zinc-800/50 border border-zinc-700 text-[10px] text-zinc-400 font-mono">
            ECS ENGINE
          </span>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode(ViewMode.SPLIT)}
            className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.SPLIT ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Split View"
          >
            <Layout className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode(ViewMode.PREVIEW)}
            className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.PREVIEW ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Preview Only"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode(ViewMode.CODE)}
            className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.CODE ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Code Only"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode(ViewMode.INSPECTOR)}
            className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.INSPECTOR ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Inspector Only"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Chat Console */}
        <aside className="w-80 md:w-96 shrink-0 z-20 shadow-xl">
          <Console 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={gameState.isLoading}
          />
        </aside>

        {/* Right: Workspace */}
        <div className="flex-1 flex flex-col bg-black relative">
          
          {/* Split Mode */}
          {viewMode === ViewMode.SPLIT && (
            <div className="flex-1 flex flex-col lg:flex-row h-full">
              {/* Left Side of Split: Preview */}
              <div className="flex-1 h-1/2 lg:h-full lg:w-3/5 border-b lg:border-b-0 lg:border-r border-zinc-800">
                <Preview code={gameState.code} version={gameState.version} onStateUpdate={handleEcsUpdate} />
              </div>
              
              {/* Right Side of Split: Inspector OR Code */}
              <div className="flex-1 h-1/2 lg:h-full lg:w-2/5 flex flex-col">
                <div className="flex border-b border-zinc-800 bg-zinc-950">
                   <button 
                     onClick={() => setRightPanelMode('INSPECTOR')}
                     className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${rightPanelMode === 'INSPECTOR' ? 'border-emerald-500 text-emerald-400 bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                   >
                     Inspector
                   </button>
                   <button 
                     onClick={() => setRightPanelMode('CODE')}
                     className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${rightPanelMode === 'CODE' ? 'border-emerald-500 text-emerald-400 bg-zinc-900/50' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                   >
                     Code
                   </button>
                </div>
                <div className="flex-1 relative overflow-hidden">
                  {rightPanelMode === 'INSPECTOR' ? (
                    <Inspector entities={ecsEntities} />
                  ) : (
                    <CodeView code={gameState.code} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Full Preview Mode */}
          {viewMode === ViewMode.PREVIEW && (
            <div className="w-full h-full">
               <Preview code={gameState.code} version={gameState.version} onStateUpdate={handleEcsUpdate} />
            </div>
          )}

          {/* Full Code Mode */}
          {viewMode === ViewMode.CODE && (
            <div className="w-full h-full">
              <CodeView code={gameState.code} />
            </div>
          )}

          {/* Full Inspector Mode */}
          {viewMode === ViewMode.INSPECTOR && (
            <div className="w-full h-full">
              <Inspector entities={ecsEntities} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;