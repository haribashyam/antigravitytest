import { describe, it, expect } from 'vitest';
import {
  predictFuelConsumption,
  calculateTripCost,
  validateTripInput,
  POPULATION_BASELINE_COEFFICIENTS,
  FuelModelValidationError,
  VehicleCoefficients,
  TripInput,
  UnitConverter,
} from '../src/lib/fuelModel';

describe('FuelWise Core Mathematical Model (fuelModel.ts)', () => {
  const zeroCoefficients: VehicleCoefficients = {
    kv: 0,
    kt: 0,
    kl: 0,
    ka: 0,
    kg: 0,
    ki: 0,
  };

  it('1. Baseline case with zero correction coefficients equals exactly D / M0', () => {
    const input: TripInput = {
      distanceKm: 100,
      baseMileageKmPerL: 15,
      avgSpeedKmh: 60,
      trafficIntensity: 0,
      loadRatio: 0,
      aggressiveFactor: 0,
      gradientDecimal: 0,
      idleMinutes: 0,
    };

    const result = predictFuelConsumption(input, zeroCoefficients);

    const expectedBaseFuel = 100 / 15; // 6.666666666666667 Litres
    expect(result.baseFuelLiters).toBeCloseTo(expectedBaseFuel, 6);
    expect(result.totalFuelLiters).toBeCloseTo(expectedBaseFuel, 6);
    expect(result.speedTermLiters).toBe(0);
    expect(result.trafficTermLiters).toBe(0);
    expect(result.loadTermLiters).toBe(0);
    expect(result.aggressiveTermLiters).toBe(0);
    expect(result.gradientTermLiters).toBe(0);
    expect(result.idleTermLiters).toBe(0);
    expect(result.effectiveMileageKmPerL).toBeCloseTo(15.0, 6);
  });

  it('2. Speed penalty term in isolation (kv * V^2)', () => {
    // D=100km, M0=15km/L, kv=0.00010, V=80km/h
    // V^2 = 6400 -> kv*V^2 = 0.64
    // Base = 100/15 = 6.6666667
    // Speed term = 6.6666667 * 0.64 = 4.2666667 Litres
    // Total = 6.6666667 * 1.64 = 10.9333333 Litres
    const input: TripInput = {
      distanceKm: 100,
      baseMileageKmPerL: 15,
      avgSpeedKmh: 80,
      trafficIntensity: 0,
      loadRatio: 0,
      aggressiveFactor: 0,
      gradientDecimal: 0,
      idleMinutes: 0,
    };
    const coeffs: VehicleCoefficients = {
      ...zeroCoefficients,
      kv: 0.00010,
    };

    const result = predictFuelConsumption(input, coeffs);

    expect(result.baseFuelLiters).toBeCloseTo(100 / 15, 6);
    expect(result.speedTermLiters).toBeCloseTo(4.2666667, 5);
    expect(result.totalFuelLiters).toBeCloseTo(10.9333333, 5);
    expect(result.effectiveMileageKmPerL).toBeCloseTo(100 / 10.9333333, 4);
  });

  it('3. Traffic intensity penalty term in isolation (kt * T)', () => {
    // D=100km, M0=15km/L, kt=0.35, T=0.8
    // kt * T = 0.28
    // Traffic term = (100/15) * 0.28 = 1.8666667 Litres
    // Total = (100/15) * 1.28 = 8.5333333 Litres
    const input: TripInput = {
      distanceKm: 100,
      baseMileageKmPerL: 15,
      avgSpeedKmh: 40,
      trafficIntensity: 0.8,
      loadRatio: 0,
      aggressiveFactor: 0,
      gradientDecimal: 0,
      idleMinutes: 0,
    };
    const coeffs: VehicleCoefficients = {
      ...zeroCoefficients,
      kt: 0.35,
    };

    const result = predictFuelConsumption(input, coeffs);

    expect(result.trafficTermLiters).toBeCloseTo(1.8666667, 5);
    expect(result.totalFuelLiters).toBeCloseTo(8.5333333, 5);
  });

  it('4. Load penalty term in isolation (kl * L)', () => {
    // D=100km, M0=15km/L, kl=0.20, L=0.75
    // kl * L = 0.15
    // Load term = (100/15) * 0.15 = 1.0000000 Litre
    // Total = (100/15) * 1.15 = 7.6666667 Litres
    const input: TripInput = {
      distanceKm: 100,
      baseMileageKmPerL: 15,
      avgSpeedKmh: 50,
      trafficIntensity: 0,
      loadRatio: 0.75,
      aggressiveFactor: 0,
      gradientDecimal: 0,
      idleMinutes: 0,
    };
    const coeffs: VehicleCoefficients = {
      ...zeroCoefficients,
      kl: 0.20,
    };

    const result = predictFuelConsumption(input, coeffs);

    expect(result.loadTermLiters).toBeCloseTo(1.0, 5);
    expect(result.totalFuelLiters).toBeCloseTo(7.6666667, 5);
  });

  it('5. Aggressive driving penalty term in isolation (ka * A)', () => {
    // D=100km, M0=15km/L, ka=0.15, A=2.0 events/km
    // ka * A = 0.30
    // Aggressive term = (100/15) * 0.30 = 2.0000000 Litres
    // Total = (100/15) * 1.30 = 8.6666667 Litres
    const input: TripInput = {
      distanceKm: 100,
      baseMileageKmPerL: 15,
      avgSpeedKmh: 60,
      trafficIntensity: 0,
      loadRatio: 0,
      aggressiveFactor: 2.0,
      gradientDecimal: 0,
      idleMinutes: 0,
    };
    const coeffs: VehicleCoefficients = {
      ...zeroCoefficients,
      ka: 0.15,
    };

    const result = predictFuelConsumption(input, coeffs);

    expect(result.aggressiveTermLiters).toBeCloseTo(2.0, 5);
    expect(result.totalFuelLiters).toBeCloseTo(8.6666667, 5);
  });

  it('6. Road gradient penalty term in isolation (kg * G)', () => {
    // D=100km, M0=15km/L, kg=1.50, G=0.04 (+4% slope)
    // kg * G = 0.06
    // Gradient term = (100/15) * 0.06 = 0.4000000 Litres
    // Total = (100/15) * 1.06 = 7.0666667 Litres
    const input: TripInput = {
      distanceKm: 100,
      baseMileageKmPerL: 15,
      avgSpeedKmh: 60,
      trafficIntensity: 0,
      loadRatio: 0,
      aggressiveFactor: 0,
      gradientDecimal: 0.04,
      idleMinutes: 0,
    };
    const coeffs: VehicleCoefficients = {
      ...zeroCoefficients,
      kg: 1.50,
    };

    const result = predictFuelConsumption(input, coeffs);

    expect(result.gradientTermLiters).toBeCloseTo(0.4, 5);
    expect(result.totalFuelLiters).toBeCloseTo(7.0666667, 5);
  });

  it('7. Idle fuel consumption term in isolation (ki * t_idle)', () => {
    // D=100km, M0=15km/L, ki=0.012 L/min, t_idle=25 min
    // Idle fuel = 0.012 * 25 = 0.3000000 Litres
    // Total = (100/15) + 0.30 = 6.9666667 Litres
    const input: TripInput = {
      distanceKm: 100,
      baseMileageKmPerL: 15,
      avgSpeedKmh: 60,
      trafficIntensity: 0,
      loadRatio: 0,
      aggressiveFactor: 0,
      gradientDecimal: 0,
      idleMinutes: 25,
    };
    const coeffs: VehicleCoefficients = {
      ...zeroCoefficients,
      ki: 0.012,
    };

    const result = predictFuelConsumption(input, coeffs);

    expect(result.idleTermLiters).toBeCloseTo(0.3, 5);
    expect(result.totalFuelLiters).toBeCloseTo(6.9666667, 5);
  });

  it('8. Combined realistic case with hand-verified expected output', () => {
    // Inputs:
    // D = 50 km, M0 = 16 km/L -> baseFuel = 50/16 = 3.125 L
    // V = 60 km/h -> kv*V^2 = 0.00010 * 3600 = 0.360
    // T = 0.4 -> kt*T = 0.35 * 0.4 = 0.140
    // L = 0.5 -> kl*L = 0.20 * 0.5 = 0.100
    // A = 0.8 -> ka*A = 0.15 * 0.8 = 0.120
    // G = 0.015 -> kg*G = 1.50 * 0.015 = 0.0225
    // Sum factor = 1 + 0.36 + 0.14 + 0.10 + 0.12 + 0.0225 = 1.7425
    // Driving fuel = 3.125 * 1.7425 = 5.4453125 L
    // t_idle = 10 min -> ki*t_idle = 0.012 * 10 = 0.120 L
    // Total F = 5.4453125 + 0.120 = 5.5653125 Litres
    const input: TripInput = {
      distanceKm: 50,
      baseMileageKmPerL: 16,
      avgSpeedKmh: 60,
      trafficIntensity: 0.4,
      loadRatio: 0.5,
      aggressiveFactor: 0.8,
      gradientDecimal: 0.015,
      idleMinutes: 10,
    };

    const result = predictFuelConsumption(input, POPULATION_BASELINE_COEFFICIENTS);

    expect(result.baseFuelLiters).toBeCloseTo(3.125, 6);
    expect(result.speedTermLiters).toBeCloseTo(3.125 * 0.360, 6);
    expect(result.trafficTermLiters).toBeCloseTo(3.125 * 0.140, 6);
    expect(result.loadTermLiters).toBeCloseTo(3.125 * 0.100, 6);
    expect(result.aggressiveTermLiters).toBeCloseTo(3.125 * 0.120, 6);
    expect(result.gradientTermLiters).toBeCloseTo(3.125 * 0.0225, 6);
    expect(result.idleTermLiters).toBeCloseTo(0.120, 6);
    expect(result.totalFuelLiters).toBeCloseTo(5.5653125, 6);
    expect(result.effectiveMileageKmPerL).toBeCloseTo(50 / 5.5653125, 4);

    // Cost calculations
    const costBreakdown = calculateTripCost(result, 50, 102.5, 'INR');
    expect(costBreakdown.totalCost).toBeCloseTo(5.5653125 * 102.5, 4);
    expect(costBreakdown.costPerKm).toBeCloseTo((5.5653125 * 102.5) / 50, 4);
  });

  it('9. Strict input validation rejects unphysical and out-of-range inputs', () => {
    // Negative distance
    expect(() =>
      validateTripInput({
        distanceKm: -10,
        baseMileageKmPerL: 15,
        avgSpeedKmh: 60,
        trafficIntensity: 0,
        loadRatio: 0,
        aggressiveFactor: 0,
        gradientDecimal: 0,
        idleMinutes: 0,
      })
    ).toThrow(FuelModelValidationError);

    // Zero M0
    expect(() =>
      validateTripInput({
        distanceKm: 50,
        baseMileageKmPerL: 0,
        avgSpeedKmh: 60,
        trafficIntensity: 0,
        loadRatio: 0,
        aggressiveFactor: 0,
        gradientDecimal: 0,
        idleMinutes: 0,
      })
    ).toThrow(FuelModelValidationError);

    // Load > 1.0
    expect(() =>
      validateTripInput({
        distanceKm: 50,
        baseMileageKmPerL: 15,
        avgSpeedKmh: 60,
        trafficIntensity: 0,
        loadRatio: 1.25,
        aggressiveFactor: 0,
        gradientDecimal: 0,
        idleMinutes: 0,
      })
    ).toThrow(FuelModelValidationError);

    // Negative idle minutes
    expect(() =>
      validateTripInput({
        distanceKm: 50,
        baseMileageKmPerL: 15,
        avgSpeedKmh: 60,
        trafficIntensity: 0,
        loadRatio: 0.5,
        aggressiveFactor: 0,
        gradientDecimal: 0,
        idleMinutes: -5,
      })
    ).toThrow(FuelModelValidationError);
  });

  it('10. Unit converter accurately handles standard conversions', () => {
    expect(UnitConverter.kmToMiles(100)).toBeCloseTo(62.1371, 3);
    expect(UnitConverter.milesToKm(62.137119)).toBeCloseTo(100, 3);
    expect(UnitConverter.litresToUsGallons(3.785411784)).toBeCloseTo(1.0, 5);
    expect(UnitConverter.kmPerLToMpgUs(10)).toBeCloseTo(23.5215, 3);
  });
});
