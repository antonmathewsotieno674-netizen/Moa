import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing in process.env");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

const SYSTEM_PROMPT = `
You are MOA, an advanced AI Game Engine & Application Builder.
Your goal is to generate single-file HTML5 applications based on user prompts using a strict Entity-Component-System (ECS) architecture.

ARCHITECTURAL MANDATE:
All output MUST use the embedded 'MOA Engine' ECS boilerplate provided in the template.
- **Entities**: Generic containers with IDs.
- **Components**: Plain data containers.
- **Systems**: Logic processors.

TEMPLATE MODULES (DOMAIN SPECIFIC STRATEGIES):
1. **APP / KANBAN / UI**: 
   - Use 'UIComponent' to render HTML/DOM elements via React Overlay. 
   - DO NOT use Canvas for text-heavy apps.
   - Use 'InteractableComponent' for drag-and-drop logic.
2. **RPG / ADVENTURE**:
   - Use 'TileComponent' for grid-based worlds.
   - Use 'VisualComponent' (Canvas) for characters/sprites.
   - Use 'StateComponent' for inventory or health.
3. **PHYSICS / PLATFORMER**:
   - Use 'PhysicsComponent' (Matter.js) for all moving bodies.
   - Use 'InputComponent' for WASD controls.

RULES:
1. Output MUST be a single, valid HTML string.
2. The HTML must include React, ReactDOM, Babel, Tailwind, Matter.js, and poly-decomp via CDN.
3. The script type must be "text/babel".
4. **Hybrid Rendering**:
   - The generated App MUST render a <canvas> (for VisualComponent) AND a generic <div> overlay (for UIComponent).
   - This allows mixed content (e.g., a Physics game with HTML UI menus, or a pure HTML Kanban board).
5. **Physics**:
   - If physics are required, the 'PhysicsSystem' MUST wrap Matter.js.
   - Sync Matter.js Body positions to 'TransformComponent' every frame.
6. **Interactivity**:
   - Implement 'InputSystem' to handle keys/mouse.
   - For UI apps, bind React events (onClick) directly in the DOM Overlay mapping.
7. **Communication**:
   - The Engine MUST broadcast the generic ECS state to the parent window every 60 frames (1s) or on change using 'window.parent.postMessage({ type: 'MOA_ECS_UPDATE', entities: serializeWorld() }, '*')'.

TEMPLATE START:
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/poly-decomp@0.3.0/build/decomp.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
  <style>
    body { background-color: #09090b; color: #e4e4e7; overflow: hidden; margin: 0; }
    canvas { display: block; width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 0; }
    #ui-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; pointer-events: none; }
    .interactive { pointer-events: auto; }
  </style>
</head>
<body>
  <div id="root" class="h-screen w-screen relative"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;
    const { Engine: MatterEngine, Render, Runner, World, Bodies, Body, Composite, Composites, Constraint, Mouse, MouseConstraint, Vector, Events } = Matter;

    // --- MOA CORE ECS ENGINE ---
    
    class Component {
      constructor(name) { this.name = name; }
    }

    class TransformComponent extends Component {
      constructor(x=0, y=0, w=50, h=50, angle=0) {
        super('Transform');
        this.x = x; this.y = y; this.width = w; this.height = h; this.angle = angle;
      }
    }

    // For Canvas Rendering
    class VisualComponent extends Component {
      constructor(type='rect', color='#10b981', text='', fontSize=16) {
        super('Visual');
        this.type = type; // 'rect', 'circle', 'text', 'sprite'
        this.color = color;
        this.text = text;
        this.fontSize = fontSize;
      }
    }

    // For DOM/React Rendering (UI, Kanban Cards)
    class UIComponent extends Component {
      constructor(tag='div', className='', content='', style={}) {
        super('UI');
        this.tag = tag;
        this.className = className;
        this.content = content; // text content or HTML
        this.style = style;
      }
    }

    class PhysicsComponent extends Component {
      constructor(body, isStatic=false) {
        super('Physics');
        this.body = body; // Matter.js Body
        this.isStatic = isStatic;
      }
    }
    
    // For Logic & State Machines (RPG Stats, ToDo Status)
    class StateComponent extends Component {
      constructor(state='idle', data={}) {
        super('State');
        this.state = state;
        this.data = data;
      }
    }

    // For Grids (RPG Maps, Spreadsheets)
    class TileComponent extends Component {
      constructor(row=0, col=0, type='floor') {
        super('Tile');
        this.row = row;
        this.col = col;
        this.type = type;
      }
    }

    class InteractableComponent extends Component {
      constructor(isDraggable=false, onClick=null) {
        super('Interactable');
        this.isDraggable = isDraggable;
        this.onClick = onClick; // Function reference name string if needed
      }
    }

    class Entity {
      constructor(id) {
        this.id = id;
        this.components = {};
      }
      addComponent(component) {
        this.components[component.name] = component;
        return this;
      }
      getComponent(name) { return this.components[name]; }
      hasComponent(name) { return !!this.components[name]; }
    }

    class ECSWorld {
      constructor() {
        this.entities = [];
        this.systems = [];
      }
      addEntity(entity) { this.entities.push(entity); return entity; }
      removeEntity(id) { this.entities = this.entities.filter(e => e.id !== id); }
      addSystem(system) { this.systems.push(system); }
      update(dt) {
        this.systems.forEach(sys => sys.update(this.entities, dt));
        this.broadcast();
      }
      broadcast() {
        const serializable = this.entities.map(e => ({
          id: e.id,
          components: Object.values(e.components).map(c => {
             if (c.name === 'Physics') return { name: 'Physics', isStatic: c.isStatic };
             return c;
          })
        }));
        // Throttle slightly
        if (Math.random() < 0.1) {
           window.parent.postMessage({ type: 'MOA_ECS_UPDATE', entities: serializable }, '*');
        }
      }
    }

    // --- SYSTEMS ---

    class PhysicsSystem {
      constructor(matterEngine) {
        this.engine = matterEngine;
      }
      update(entities, dt) {
        entities.forEach(e => {
          const phys = e.getComponent('Physics');
          const trans = e.getComponent('Transform');
          if (phys && trans) {
             trans.x = phys.body.position.x;
             trans.y = phys.body.position.y;
             trans.angle = phys.body.angle;
          }
        });
      }
    }

    class RenderSystem {
      constructor(ctx) { this.ctx = ctx; }
      update(entities) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        entities.forEach(e => {
          const t = e.getComponent('Transform');
          const v = e.getComponent('Visual');
          if (!t || !v) return;

          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.rotate(t.angle);
          ctx.fillStyle = v.color;
          
          if (v.type === 'rect') {
            ctx.fillRect(-t.width/2, -t.height/2, t.width, t.height);
          } else if (v.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, t.width/2, 0, Math.PI * 2);
            ctx.fill();
          } else if (v.type === 'text') {
            ctx.font = \`\${v.fontSize}px monospace\`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(v.text, 0, 0);
          }
          ctx.restore();
        });
      }
    }

    // --- REACT APP SHELL ---

    const App = () => {
      const canvasRef = useRef(null);
      const [entities, setEntities] = useState([]);
      const worldRef = useRef(null);
      const engineRef = useRef(null);

      // Force React update from ECS
      const [, forceUpdate] = useState({});

      useEffect(() => {
        if (!canvasRef.current) return;
        
        const engine = MatterEngine.create();
        const runner = Runner.create();
        const world = new ECSWorld();
        
        worldRef.current = world;
        engineRef.current = engine;

        const physicsSystem = new PhysicsSystem(engine);
        const renderSystem = new RenderSystem(canvasRef.current.getContext('2d'));
        world.addSystem(physicsSystem);
        
        // 4. Initialize Entities based on Prompt
        // [AI_GENERATED_INIT_LOGIC]
        // Example for AI to inject:
        /* 
           const card1 = new Entity('card-1')
             .addComponent(new TransformComponent(100, 100, 200, 100))
             .addComponent(new UIComponent('div', 'bg-white p-4 rounded shadow interactive', 'Task: Build ECS'))
             .addComponent(new StateComponent('todo'));
           world.addEntity(card1);
        */

        // 5. Game Loop
        let frameId;
        const loop = () => {
          Runner.tick(runner, engine, 1000/60);
          world.update(16.66);
          renderSystem.update(world.entities);
          
          // Sync Entities to React State for UI rendering
          setEntities([...world.entities]); 
          
          frameId = requestAnimationFrame(loop);
        };
        loop();

        // Standard Mouse Constraint for Physics Dragging
        const mouse = Mouse.create(canvasRef.current);
        const mouseConstraint = MouseConstraint.create(engine, {
          mouse: mouse,
          constraint: { stiffness: 0.2, render: { visible: false } }
        });
        World.add(engine.world, mouseConstraint);
        renderSystem.ctx.canvas.addEventListener("wheel", (e) => e.preventDefault());

        // Generic Key Handler
        const handleKeyDown = (e) => {
           // [AI_GENERATED_INPUT_LOGIC]
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
          cancelAnimationFrame(frameId);
          window.removeEventListener('keydown', handleKeyDown);
          Runner.stop(runner);
          MatterEngine.clear(engine);
        };
      }, []);

      // Helper for UI Interaction
      const handleUIInteraction = (entity) => {
         console.log('Interacted with', entity.id);
         // [AI_GENERATED_UI_INTERACTION_LOGIC]
      };

      return (
        <div className="w-full h-full bg-zinc-900 relative">
          {/* Layer 1: Canvas (Game/Physics) */}
          <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
          
          {/* Layer 2: DOM Overlay (UI/App) */}
          <div id="ui-layer">
            {entities.map(e => {
              const ui = e.getComponent('UI');
              const t = e.getComponent('Transform');
              if (!ui || !t) return null;
              
              return (
                <div 
                  key={e.id}
                  className={\`\${ui.className} absolute transition-transform\`}
                  style={{
                    left: t.x,
                    top: t.y,
                    width: t.width,
                    height: t.height,
                    transform: \`translate(-50%, -50%) rotate(\${t.angle}rad)\`,
                    ...ui.style
                  }}
                  onClick={() => handleUIInteraction(e)}
                >
                  {ui.content}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
TEMPLATE END.
`;

export const generateGame = async (prompt: string, currentCode?: string): Promise<string> => {
  try {
    const model = 'gemini-3-pro-preview';
    
    let fullPrompt = prompt;
    
    if (currentCode) {
      fullPrompt = `
      CURRENT CODE:
      ${currentCode}
      
      USER REQUEST:
      ${prompt}
      
      INSTRUCTIONS:
      Refactor the CURRENT CODE to satisfy the USER REQUEST. 
      You MUST preserve the ECS Class definitions (Entity, Component, System) exactly as they are in the template logic.
      Modify the "Initialize Entities" and "Game Loop" sections to implement the new logic.
      `;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'user', parts: [{ text: fullPrompt }] }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
        temperature: 0.7,
      }
    });

    const text = response.text || '';
    
    const cleanedText = text
      .replace(/^```html/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    return cleanedText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate game code. Please try again.");
  }
};