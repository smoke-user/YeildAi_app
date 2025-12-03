export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Field {
  id: string;
  name: string;
  areaHa: number;
  coordinates: Coordinate[];
  cropType?: string;
  plantingDate?: string;
  notes?: string;
}

export interface DroneStatus {
  connected: boolean;
  battery: number;
  altitude: number;
  speed: number;
  status: 'IDLE' | 'MAPPING' | 'RETURNING' | 'OFFLINE';
  model: string;
}

export interface FertilizerPlan {
  productName: string;
  amountPerHa: string;
  totalAmount: string;
  applicationMethod: string;
  safetyAdvice: string;
}

export interface SeedPlan {
  cropType: string;
  seedVarietyRecommendation: string;
  seedsPerHa: string;
  totalSeedsNeeded: string;
  optimalPlantingDepth: string;
}

export type ViewState = 'DASHBOARD' | 'MAPPING' | 'CALCULATOR' | 'DRONE_CONTROL';