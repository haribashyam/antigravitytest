/**
 * FuelWise Core Mathematical Fuel Consumption & Cost Engine
 *
 * Implements the exact specification:
 * F = (D / M0) * (1 + kv*V^2 + kt*T + kl*L + ka*A + kg*G) + ki * t_idle
 *
 * All physical quantities carry explicit units:
 * - F: Litres (L)
 * - D: Kilometres (km)
 * - M0: Base/ideal vehicle mileage (km/L)
 * - V: Average speed (km/h)
 * - T: Traffic intensity factor [0.0 - 1.0]
 * - L: Vehicle load normalized to rated payload [0.0 - 1.0]
 * - A: Aggressive driving factor (hard accel + brake events per km)
 * - G: Average road gradient (decimal, e.g. 0.02 for +2%)
 * - t_idle: Total idling time (minutes)
 * - P: Fuel price per litre (currency / L)
 */

export interface VehicleCoefficients {
  kv: number; // Speed squared aerodynamic coefficient [ (km/h)^-2 ]
  kt: number; // Traffic intensity coefficient
  kl: number; // Payload load coefficient
  ka: number; // Aggressive driving coefficient [ (events/km)^-1 ]
  kg: number; // Road gradient coefficient [ gradient^-1 ]
  ki: number; // Idle fuel rate [ litres / minute ]
}

export interface TripInput {
  distanceKm: number;
  baseMileageKmPerL: number; // M0
  avgSpeedKmh: number;
  trafficIntensity: number; // 0 (free-flow) to 1 (standstill congestion)
  loadRatio: number; // 0 (empty) to 1 (full payload)
  aggressiveFactor: number; // hard events per km
  gradientDecimal: number; // e.g. 0.02 = +2% incline, -0.01 = -1% decline
  idleMinutes: number; // minutes idling
}

export interface FuelBreakdown {
  baseFuelLiters: number;
  speedTermLiters: number;
  trafficTermLiters: number;
  loadTermLiters: number;
  aggressiveTermLiters: number;
  gradientTermLiters: number;
  idleTermLiters: number;
  totalFuelLiters: number;
  effectiveMileageKmPerL: number;
  contributionsPct: {
    base: number;
    speed: number;
    traffic: number;
    load: number;
    aggressive: number;
    gradient: number;
    idle: number;
  };
}

export interface CostBreakdown extends FuelBreakdown {
  fuelPricePerLitre: number;
  currency: string;
  totalCost: number;
  costPerKm: number;
}

/**
 * Standard Population Engineering Baseline Coefficients.
 * Used transparently when a vehicle has fewer than 8 logged trips.
 * Derived from automotive engineering empirical datasets.
 */
export const POPULATION_BASELINE_COEFFICIENTS: Readonly<VehicleCoefficients> = Object.freeze({
  kv: 0.00010, // ~100% penalty at 100 km/h over base aerodynamic drag
  kt: 0.35,    // +35% fuel in heavy stop-and-go traffic
  kl: 0.20,    // +20% fuel at maximum rated payload
  ka: 0.15,    // +15% fuel per aggressive event/km
  kg: 1.50,    // +1.50 * 0.02 = +3% fuel per 2% uphill grade
  ki: 0.012,   // 0.72 L/hr idle rate = 0.012 L/min
});

export const MIN_TRIPS_FOR_CALIBRATION = 8;

export class FuelModelValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'FuelModelValidationError';
  }
}

/**
 * Validate trip inputs according to physical constraints.
 * Throws FuelModelValidationError if any value violates physical reality.
 */
export function validateTripInput(input: TripInput): void {
  if (input.distanceKm <= 0 || !Number.isFinite(input.distanceKm)) {
    throw new FuelModelValidationError('Distance (D) must be strictly greater than 0 km.', 'distanceKm');
  }
  if (input.baseMileageKmPerL <= 0 || !Number.isFinite(input.baseMileageKmPerL)) {
    throw new FuelModelValidationError('Base mileage (M0) must be strictly greater than 0 km/L.', 'baseMileageKmPerL');
  }
  if (input.avgSpeedKmh <= 0 || !Number.isFinite(input.avgSpeedKmh)) {
    throw new FuelModelValidationError('Average speed (V) must be strictly greater than 0 km/h.', 'avgSpeedKmh');
  }
  if (input.trafficIntensity < 0 || input.trafficIntensity > 1 || !Number.isFinite(input.trafficIntensity)) {
    throw new FuelModelValidationError('Traffic intensity (T) must be normalized between 0.0 and 1.0.', 'trafficIntensity');
  }
  if (input.loadRatio < 0 || input.loadRatio > 1 || !Number.isFinite(input.loadRatio)) {
    throw new FuelModelValidationError('Load ratio (L) must be normalized between 0.0 and 1.0 of rated payload.', 'loadRatio');
  }
  if (input.aggressiveFactor < 0 || !Number.isFinite(input.aggressiveFactor)) {
    throw new FuelModelValidationError('Aggressive driving factor (A) cannot be negative.', 'aggressiveFactor');
  }
  if (!Number.isFinite(input.gradientDecimal)) {
    throw new FuelModelValidationError('Gradient (G) must be a finite decimal value.', 'gradientDecimal');
  }
  if (input.idleMinutes < 0 || !Number.isFinite(input.idleMinutes)) {
    throw new FuelModelValidationError('Idle time (t_idle) cannot be negative.', 'idleMinutes');
  }
}

/**
 * Core Pure Calculation Function:
 * Predicts fuel consumption and computes complete term breakdown.
 *
 * Equation:
 * F = (D / M0) * (1 + kv*V^2 + kt*T + kl*L + ka*A + kg*G) + ki * t_idle
 */
export function predictFuelConsumption(
  input: TripInput,
  coefficients: VehicleCoefficients = POPULATION_BASELINE_COEFFICIENTS
): FuelBreakdown {
  validateTripInput(input);

  const {
    distanceKm: D,
    baseMileageKmPerL: M0,
    avgSpeedKmh: V,
    trafficIntensity: T,
    loadRatio: L,
    aggressiveFactor: A,
    gradientDecimal: G,
    idleMinutes: t_idle,
  } = input;

  const { kv, kt, kl, ka, kg, ki } = coefficients;

  // Base fuel: distance / base mileage (litres)
  const baseFuelLiters = D / M0;

  // Penalty terms (each multiplied by baseFuel):
  const speedTermLiters = baseFuelLiters * (kv * (V * V));
  const trafficTermLiters = baseFuelLiters * (kt * T);
  const loadTermLiters = baseFuelLiters * (kl * L);
  const aggressiveTermLiters = baseFuelLiters * (ka * A);
  const gradientTermLiters = baseFuelLiters * (kg * G);

  // Idle fuel term: independent of distance
  const idleTermLiters = ki * t_idle;

  // Raw total sum
  const rawTotal =
    baseFuelLiters +
    speedTermLiters +
    trafficTermLiters +
    loadTermLiters +
    aggressiveTermLiters +
    gradientTermLiters +
    idleTermLiters;

  // Physical constraint: fuel consumption cannot be negative
  const totalFuelLiters = Math.max(0, rawTotal);

  // Effective mileage achieved on this trip (km/L)
  const effectiveMileageKmPerL = totalFuelLiters > 0 ? D / totalFuelLiters : 0;

  // Percentage contribution of each factor to the total
  const safeTotal = totalFuelLiters > 0 ? totalFuelLiters : 1;
  const contributionsPct = {
    base: (baseFuelLiters / safeTotal) * 100,
    speed: (speedTermLiters / safeTotal) * 100,
    traffic: (trafficTermLiters / safeTotal) * 100,
    load: (loadTermLiters / safeTotal) * 100,
    aggressive: (aggressiveTermLiters / safeTotal) * 100,
    gradient: (gradientTermLiters / safeTotal) * 100,
    idle: (idleTermLiters / safeTotal) * 100,
  };

  return {
    baseFuelLiters,
    speedTermLiters,
    trafficTermLiters,
    loadTermLiters,
    aggressiveTermLiters,
    gradientTermLiters,
    idleTermLiters,
    totalFuelLiters,
    effectiveMileageKmPerL,
    contributionsPct,
  };
}

/**
 * Computes fuel cost given fuel price per litre.
 *
 * Equations:
 * Cost = F * P
 * Cost_per_km = Cost / D
 * Effective_mileage = D / F
 */
export function calculateTripCost(
  prediction: FuelBreakdown,
  distanceKm: number,
  fuelPricePerLitre: number,
  currency: string = 'INR'
): CostBreakdown {
  if (fuelPricePerLitre < 0 || !Number.isFinite(fuelPricePerLitre)) {
    throw new FuelModelValidationError('Fuel price per litre cannot be negative.', 'fuelPricePerLitre');
  }
  if (distanceKm <= 0 || !Number.isFinite(distanceKm)) {
    throw new FuelModelValidationError('Distance must be greater than 0 km to compute cost per km.', 'distanceKm');
  }

  const totalCost = prediction.totalFuelLiters * fuelPricePerLitre;
  const costPerKm = totalCost / distanceKm;

  return {
    ...prediction,
    fuelPricePerLitre,
    currency,
    totalCost,
    costPerKm,
  };
}

/**
 * Unit conversion utilities with exact physical constants
 */
export const UnitConverter = {
  kmToMiles: (km: number) => km * 0.62137119,
  milesToKm: (miles: number) => miles * 1.609344,
  litresToUsGallons: (litres: number) => litres * 0.26417205,
  usGallonsToLitres: (gallons: number) => gallons * 3.785411784,
  kmPerLToMpgUs: (kmPerL: number) => kmPerL * 2.35214583,
  mpgUsToKmPerL: (mpg: number) => mpg * 0.425143707,
  kgToLbs: (kg: number) => kg * 2.20462262,
  lbsToKg: (lbs: number) => lbs * 0.45359237,
};
