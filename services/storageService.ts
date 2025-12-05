
import { Field } from '../types';

// STABLE KEY - We use this as the "Hard Backup"
const STORAGE_KEY = 'yield_ai_db_backup_v1';

export const StorageService = {
  // Save entire array to storage (Backup)
  saveFields: (fields: Field[]): boolean => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
      return true;
    } catch (e) {
      console.error("[Storage] Backup Save Error:", e);
      return false;
    }
  },

  // Get array from storage
  getFields: (): Field[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (e) {
      console.error("[Storage] Backup Load Error:", e);
      return [];
    }
  },

  // Generate demo data for the Hackathon showcase
  getDemoFields: (): Field[] => {
    return [
      {
        id: 'demo_1',
        name: 'Demo: Cotton Field A1',
        areaHa: 12.5,
        coordinates: [{lat: 41.2995, lng: 69.2401}], // Center of Tashkent (Example)
        plantingDate: '2025-04-01',
        cropType: 'Cotton',
        soilType: 'sierozem',
        seedPlan: {
          cropType: 'Cotton',
          seedVarietyRecommendation: 'Sultan (Local UZ)',
          thousandSeedWeight: '120g',
          seedsPerHa: '25 kg/ha',
          totalSeedsNeeded: '312.5 kg',
          optimalPlantingDepth: '4-5 cm',
          estimatedYieldProjection: 'Based on 3.5t/ha target, we optimized for standard density.',
          sourceCitation: 'GOST 23577-79',
          operationPlan: [
            { stepName: 'Soil Prep', timing: 'March 15', description: 'Deep plowing and leveling' },
            { stepName: 'Seeding', timing: 'April 1-10', description: 'Precision seeding with 60cm row spacing' }
          ],
          createdAt: new Date().toISOString()
        }
      },
      {
        id: 'demo_2',
        name: 'Demo: Wheat Sector North',
        areaHa: 45.2,
        coordinates: [{lat: 41.3, lng: 69.25}],
        plantingDate: '2024-10-15',
        cropType: 'Winter Wheat',
        soilType: 'loam',
        fertilizerPlan: {
            productName: 'Ammonium Nitrate',
            amountPerHa: '200 kg/ha',
            totalAmount: '9040 kg',
            applicationMethod: 'Broadcast spreading before rain',
            safetyAdvice: 'Wear mask and gloves. Do not mix with urea.',
            suitabilityAnalysis: 'Suitable for vegetative growth stage.',
            recommendedSoilTests: ['Nitrate Nitrogen (N-NO3)'],
            createdAt: new Date().toISOString()
        }
      }
    ];
  }
};
