
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
}

export interface OperationStep {
  stepName: string;
  timing: string;
  description: string;
}

export interface SeedPlan {
  cropType: string;
  seedVarietyRecommendation: string;
  seedsPerHa: string;
  totalSeedsNeeded: string;
  optimalPlantingDepth: string;
  fertilizerRecommendation?: string;
  operationPlan?: OperationStep[];
}

export interface AIPlan {
  type: 'SEEDING' | 'FERTILIZER';
  createdAt: string;
  summary: string;
  details: SeedPlan | FertilizerPlan;
}

export interface Field {
  id: string;
  name: string;
  areaHa: number;
  coordinates: Coordinate[];
  cropType?: string;
  plantingDate?: string;
  notes?: string;
  aiPlan?: AIPlan; // Persisted AI Recommendation
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

export type ViewState = 'DASHBOARD' | 'MAPPING' | 'CALCULATOR' | 'DRONE_CONTROL' | 'AI_CHAT';
