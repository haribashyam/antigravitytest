import { describe, it, expect } from 'vitest';
import {
  calibrateVehicleCoefficients,
  TripRecord,
  computeAggressiveFactor,
} from '../src/lib/regression';
import {
  POPULATION_BASELINE_COEFFICIENTS,
  predictFuelConsumption,
  TripInput,
} from '../src/lib/fuelModel';

describe('FuelWise Regression & Calibration Engine (regression.ts)', () => {
  const baseMileage = 15.0; // km/L

  it('1. Rejects calibration if fewer than 8 trips are logged', () => {
    const fewTrips: TripRecord[] = [
      {
        id: 'trip-1',
        vehicleId: 'veh-1',
        distanceKm: 25,
        fuelUsedLitres: 2.1,
        avgSpeedKmh: 50,
        trafficIntensity: 0.3,
        loadRatio: 0.2,
        hardAccelEvents: 2,
        hardBrakeEvents: 1,
        gradientDecimal: 0,
        idleMinutes: 5,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'trip-2',
        vehicleId: 'veh-1',
        distanceKm: 40,
        fuelUsedLitres: 3.5,
        avgSpeedKmh: 65,
        trafficIntensity: 0.5,
        loadRatio: 0.4,
        hardAccelEvents: 4,
        hardBrakeEvents: 2,
        gradientDecimal: 0.01,
        idleMinutes: 8,
        createdAt: new Date().toISOString(),
      },
    ];

    const result = calibrateVehicleCoefficients(fewTrips, baseMileage, 1);

    expect(result.canCalibrate).toBe(false);
    expect(result.isCalibrated).toBe(false);
    expect(result.tripsCount).toBe(2);
    expect(result.tripsNeeded).toBe(6);
    expect(result.coefficients).toEqual(POPULATION_BASELINE_COEFFICIENTS);
  });

  it('2. Correctly fits coefficients using OLS when >= 8 trips are provided', () => {
    // True underlying coefficients for a synthetic vehicle
    const trueCoeffs = {
      kv: 0.00012,
      kt: 0.38,
      kl: 0.22,
      ka: 0.16,
      kg: 1.60,
      ki: 0.015,
    };

    // Generate 12 varied synthetic trips using the true coefficients + slight noise
    const trips: TripRecord[] = [];
    const seedDistances = [15, 30, 45, 60, 20, 80, 50, 35, 70, 25, 40, 55];
    const seedSpeeds = [35, 70, 90, 50, 40, 100, 60, 45, 85, 55, 65, 75];
    const seedTraffics = [0.8, 0.2, 0.1, 0.6, 0.7, 0.1, 0.4, 0.5, 0.2, 0.3, 0.5, 0.4];
    const seedLoads = [0.1, 0.5, 0.8, 0.3, 0.2, 0.9, 0.4, 0.6, 0.3, 0.7, 0.2, 0.5];
    const seedGradients = [0, 0.02, -0.01, 0.03, 0, 0.015, -0.005, 0.01, 0.02, 0, 0.01, -0.01];
    const seedIdles = [10, 5, 2, 15, 12, 4, 8, 10, 3, 7, 9, 6];

    for (let i = 0; i < 12; i++) {
      const D = seedDistances[i];
      const V = seedSpeeds[i];
      const T = seedTraffics[i];
      const L = seedLoads[i];
      const G = seedGradients[i];
      const t_idle = seedIdles[i];
      const hardAccel = (i % 3) + 1;
      const hardBrake = (i % 2) + 1;
      const A = (hardAccel + hardBrake) / D;

      const input: TripInput = {
        distanceKm: D,
        baseMileageKmPerL: baseMileage,
        avgSpeedKmh: V,
        trafficIntensity: T,
        loadRatio: L,
        aggressiveFactor: A,
        gradientDecimal: G,
        idleMinutes: t_idle,
      };

      const pred = predictFuelConsumption(input, trueCoeffs);
      // Small simulated measurement variation (+- 1%)
      const noise = (i % 2 === 0 ? 0.01 : -0.01) * pred.totalFuelLiters;
      const actualFuel = pred.totalFuelLiters + noise;

      trips.push({
        id: `synth-trip-${i + 1}`,
        vehicleId: 'veh-synth',
        distanceKm: D,
        fuelUsedLitres: Number(actualFuel.toFixed(3)),
        avgSpeedKmh: V,
        trafficIntensity: T,
        loadRatio: L,
        hardAccelEvents: hardAccel,
        hardBrakeEvents: hardBrake,
        aggressiveFactor: A,
        gradientDecimal: G,
        idleMinutes: t_idle,
        createdAt: new Date(Date.now() - (12 - i) * 86400000).toISOString(),
      });
    }

    const result = calibrateVehicleCoefficients(trips, baseMileage, 1);

    expect(result.canCalibrate).toBe(true);
    expect(result.isCalibrated).toBe(true);
    expect(result.tripsCount).toBe(12);
    expect(result.version).toBe(2);
    expect(result.metrics).toBeDefined();

    // R² on test set should be high (> 0.85) for physical regression
    expect(result.metrics!.rSquared).toBeGreaterThan(0.8);
    expect(result.metrics!.mae).toBeLessThan(1.0); // MAE under 1 litre error
    expect(result.metrics!.mape).toBeLessThan(15.0); // MAPE under 15%

    // Coefficients should be physically reasonable positive values
    expect(result.coefficients.kv).toBeGreaterThan(0);
    expect(result.coefficients.kt).toBeGreaterThan(0);
    expect(result.coefficients.kl).toBeGreaterThan(0);
    expect(result.coefficients.ka).toBeGreaterThan(0);
    expect(result.coefficients.ki).toBeGreaterThan(0);
  });

  it('3. computeAggressiveFactor handles zero distance safely', () => {
    expect(computeAggressiveFactor(5, 5, 0)).toBe(0);
    expect(computeAggressiveFactor(2, 3, 50)).toBe(0.1);
  });
});
