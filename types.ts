
export interface Coordinate {
  lat: number;
  lng: number;
}

export interface FertilizerPlan {
  productName: string;
  amountPerHa: string;
  totalAmount: string;
  applicationMethod: string;
  safetyAdvice: string;
  suitabilityAnalysis?: string; // New: AI explanation of fit
  recommendedSoilTests?: string[]; // New: List of labs needed
  createdAt?: string;
}

export interface OperationStep {
  stepName: string;
  timing: string;
  description: string;
}

export interface SeedPlan {
  cropType: string;
  seedVarietyRecommendation: string;
  thousandSeedWeight?: string; // Mass of 1000 seeds
  seedsPerHa: string; // Now explicitly kg/ha
  totalSeedsNeeded: string; // Total kg
  optimalPlantingDepth: string;
  fertilizerRecommendation?: string;
  operationPlan?: OperationStep[];
  estimatedYieldProjection?: string; 
  sourceCitation?: string; 
  createdAt?: string;
}

export interface Field {
  id: string;
  name: string;
  areaHa: number;
  coordinates: Coordinate[];
  plantingDate?: string;
  notes?: string;
  
  // Persisted Calculator Inputs
  cropType?: string;
  soilType?: string;
  
  // Persisted AI Plans (Independent slots)
  seedPlan?: SeedPlan;
  fertilizerPlan?: FertilizerPlan;
}

export interface DroneStatus {
  connected: boolean;
  battery: number;
  altitude: number;
  speed: number;
  status: 'IDLE' | 'MAPPING' | 'RETURNING' | 'OFFLINE';
  model: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  timestamp: number;
}

// RAG TYPES
export interface RAGDocument {
  id: string;
  title: string;
  type: 'PDF' | 'TEXT';
  uploadDate: number;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  chunks: number; // count of vector chunks
}

export interface RAGChunk {
  id: string;
  docId: string;
  text: string;
  embedding: number[];
}

export type ViewState = 'DASHBOARD' | 'MAPPING' | 'CALCULATOR' | 'DRONE_CONTROL' | 'AI_CHAT' | 'KNOWLEDGE_BASE' | 'PRESENTATION';
