export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export interface GameState {
  code: string;
  version: number;
  isLoading: boolean;
  error: string | null;
}

export enum ViewMode {
  SPLIT = 'SPLIT',
  CODE = 'CODE',
  PREVIEW = 'PREVIEW',
  INSPECTOR = 'INSPECTOR'
}

export interface ComponentData {
  name: string;
  [key: string]: any;
}

export interface EntityData {
  id: string;
  components: ComponentData[];
}

export interface InspectorState {
  entities: EntityData[];
  lastUpdate: number;
}