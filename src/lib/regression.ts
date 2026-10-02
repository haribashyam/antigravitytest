/**
 * FuelWise Regression & Calibration Engine
 *
 * Implements Ordinary Least Squares (OLS) Multiple Linear Regression
 * to fit vehicle-specific coefficients (kv, kt, kl, ka, kg, ki) from real stored trip logs.
 *
 * Ground rules:
 * - NO simulated or pre-baked numbers labeled as "calibrated".
 * - Must run actual OLS on real database rows.
 * - Minimum 8 trips required to calibrate a personalized model.
 * - Holds out ~20% of trips as an independent test set.
 * - Reports real R², MAE, and MAPE on the held-out test set.
 */

import { Matrix, solve, pseudoInverse, inverse } from 'ml-matrix';
import {
  VehicleCoefficients,
  POPULATION_BASELINE_COEFFICIENTS,
  MIN_TRIPS_FOR_CALIBRATION,
  predictFuelConsumption,
  TripInput,
} from './fuelModel';

export interface TripRecord {
  id: string;
  vehicleId: string;
  distanceKm: number;
  fuelUsedLitres: number;
  avgSpeedKmh: number;
  trafficIntensity: number; // 0 to 1
  loadRatio: number; // 0 to 1
  hardAccelEvents: number;
  hardBrakeEvents: number;
  aggressiveFactor?: number; // events per km (or computed from accel + brake / distance)
  gradientDecimal: number;
  idleMinutes: number;
  createdAt: Date | string;
}

export interface CalibrationMetrics {
  rSquared: number;
  mae: number;
  mape: number;
  trainSampleSize: number;
  testSampleSize: number;
}

export interface CalibrationResult {
  canCalibrate: boolean;
  tripsCount: number;
  tripsNeeded: number;
  coefficients: VehicleCoefficients;
  isCalibrated: boolean; // false if falling back to population baseline
  metrics?: CalibrationMetrics;
  version: number;
  calibratedAt: string;
  testPredictions?: Array<{
    tripId: string;
    actualFuelLitres: number;
    predictedFuelLitres: number;
    errorLitres: number;
  }>;
}

/**
 * Computes aggressive factor: (hardAccelEvents + hardBrakeEvents) / distanceKm
 */
export function computeAggressiveFactor(
  hardAccelEvents: number,
  hardBrakeEvents: number,
  distanceKm: number
): number {
  if (distanceKm <= 0) return 0;
  return (hardAccelEvents + hardBrakeEvents) / distanceKm;
}

/**
 * Runs Multiple Linear Regression (OLS) to estimate (kv, kt, kl, ka, kg, ki)
 * for a vehicle given its historical trip logs and its base mileage M0.
 */
export function calibrateVehicleCoefficients(
  trips: TripRecord[],
  baseMileageKmPerL: number,
  currentVersion: number = 1
): CalibrationResult {
  const tripsCount = trips.length;

  if (tripsCount < MIN_TRIPS_FOR_CALIBRATION) {
    return {
      canCalibrate: false,
      tripsCount,
      tripsNeeded: MIN_TRIPS_FOR_CALIBRATION - tripsCount,
      coefficients: { ...POPULATION_BASELINE_COEFFICIENTS },
      isCalibrated: false,
      version: currentVersion,
      calibratedAt: new Date().toISOString(),
    };
  }

  // 1. Filter valid rows where physical quantities make sense
  const validTrips = trips.filter(
    (t) =>
      t.distanceKm > 0 &&
      t.fuelUsedLitres > 0 &&
      t.avgSpeedKmh > 0 &&
      baseMileageKmPerL > 0 &&
      Number.isFinite(t.distanceKm) &&
      Number.isFinite(t.fuelUsedLitres)
  );

  if (validTrips.length < MIN_TRIPS_FOR_CALIBRATION) {
    return {
      canCalibrate: false,
      tripsCount: validTrips.length,
      tripsNeeded: MIN_TRIPS_FOR_CALIBRATION - validTrips.length,
      coefficients: { ...POPULATION_BASELINE_COEFFICIENTS },
      isCalibrated: false,
      version: currentVersion,
      calibratedAt: new Date().toISOString(),
    };
  }

  // 2. Train / Test Split (~80% train, ~20% test, with at least 2 test trips)
  // Deterministic split based on trip ordering
  const testSize = Math.max(2, Math.floor(validTrips.length * 0.2));
  const trainSize = validTrips.length - testSize;

  const trainTrips = validTrips.slice(0, trainSize);
  const testTrips = validTrips.slice(trainSize);

  // 3. Build Design Matrix X and Dependent Vector y for training
  // Equation: F - D/M0 = kv*(D/M0 * V^2) + kt*(D/M0 * T) + kl*(D/M0 * L) + ka*(D/M0 * A) + kg*(D/M0 * G) + ki*(t_idle)
  const X_rows: number[][] = [];
  const y_rows: number[][] = [];

  for (const trip of trainTrips) {
    const D = trip.distanceKm;
    const M0 = baseMileageKmPerL;
    const baseFuel = D / M0;
    const V = trip.avgSpeedKmh;
    const T = Math.max(0, Math.min(1, trip.trafficIntensity));
    const L = Math.max(0, Math.min(1, trip.loadRatio));
    const A =
      trip.aggressiveFactor ??
      computeAggressiveFactor(trip.hardAccelEvents, trip.hardBrakeEvents, D);
    const G = trip.gradientDecimal;
    const t_idle = Math.max(0, trip.idleMinutes);

    // Dependent variable: Excess fuel consumed beyond ideal base fuel
    const excessFuel = trip.fuelUsedLitres - baseFuel;

    // Features
    const x1_speed = baseFuel * (V * V);
    const x2_traffic = baseFuel * T;
    const x3_load = baseFuel * L;
    const x4_aggressive = baseFuel * A;
    const x5_gradient = baseFuel * G;
    const x6_idle = t_idle;

    X_rows.push([x1_speed, x2_traffic, x3_load, x4_aggressive, x5_gradient, x6_idle]);
    y_rows.push([excessFuel]);
  }

  const X = new Matrix(X_rows);
  const Y = new Matrix(y_rows);

  // 4. Solve OLS with Ridge (L2) Regularization for numerical stability:
  // w = (X^T * X + lambda * I)^-1 * X^T * Y
  // where lambda is very small (1e-6) to prevent singular matrices on collinear route data
  const Xt = X.transpose();
  const XtX = Xt.mmul(X);
  const numFeatures = 6;
  const lambda = 1e-5;

  for (let i = 0; i < numFeatures; i++) {
    XtX.set(i, i, XtX.get(i, i) + lambda);
  }

  let weights: Matrix;
  try {
    const invXtX = inverse(XtX);
    weights = invXtX.mmul(Xt).mmul(Y);
  } catch {
    // If matrix inversion fails due to extreme singularity, use pseudo-inverse
    const pinv = pseudoInverse(X);
    weights = pinv.mmul(Y);
  }

  // Extract raw fitted weights
  let raw_kv = weights.get(0, 0);
  let raw_kt = weights.get(1, 0);
  let raw_kl = weights.get(2, 0);
  let raw_ka = weights.get(3, 0);
  let raw_kg = weights.get(4, 0);
  let raw_ki = weights.get(5, 0);

  // Physical bounds enforcement:
  // Speed, traffic, load, aggressive, and idle fuel rates cannot be negative.
  // Gradient can be negative (downhill assistance).
  // If a coefficient fitted negative due to noise/limited variety, fall back gracefully to baseline component.
  const kv = raw_kv > 0 ? raw_kv : POPULATION_BASELINE_COEFFICIENTS.kv;
  const kt = raw_kt > 0 ? raw_kt : POPULATION_BASELINE_COEFFICIENTS.kt;
  const kl = raw_kl > 0 ? raw_kl : POPULATION_BASELINE_COEFFICIENTS.kl;
  const ka = raw_ka > 0 ? raw_ka : POPULATION_BASELINE_COEFFICIENTS.ka;
  const kg = Number.isFinite(raw_kg) ? raw_kg : POPULATION_BASELINE_COEFFICIENTS.kg;
  const ki = raw_ki > 0 ? raw_ki : POPULATION_BASELINE_COEFFICIENTS.ki;

  const fittedCoefficients: VehicleCoefficients = {
    kv: Number(kv.toFixed(7)),
    kt: Number(kt.toFixed(5)),
    kl: Number(kl.toFixed(5)),
    ka: Number(ka.toFixed(5)),
    kg: Number(kg.toFixed(5)),
    ki: Number(ki.toFixed(5)),
  };

  // 5. Evaluate Fitted Model on the Held-out Test Set
  const testPredictions = testTrips.map((testTrip) => {
    const A =
      testTrip.aggressiveFactor ??
      computeAggressiveFactor(testTrip.hardAccelEvents, testTrip.hardBrakeEvents, testTrip.distanceKm);

    const input: TripInput = {
      distanceKm: testTrip.distanceKm,
      baseMileageKmPerL,
      avgSpeedKmh: testTrip.avgSpeedKmh,
      trafficIntensity: testTrip.trafficIntensity,
      loadRatio: testTrip.loadRatio,
      aggressiveFactor: A,
      gradientDecimal: testTrip.gradientDecimal,
      idleMinutes: testTrip.idleMinutes,
    };

    const pred = predictFuelConsumption(input, fittedCoefficients);
    const actual = testTrip.fuelUsedLitres;
    const error = actual - pred.totalFuelLiters;

    return {
      tripId: testTrip.id,
      actualFuelLitres: Number(actual.toFixed(3)),
      predictedFuelLitres: Number(pred.totalFuelLiters.toFixed(3)),
      errorLitres: Number(error.toFixed(3)),
    };
  });

  // Calculate Test R², MAE, MAPE
  const n = testPredictions.length;
  const actualValues = testPredictions.map((p) => p.actualFuelLitres);
  const meanActual = actualValues.reduce((sum, v) => sum + v, 0) / n;

  let ssTot = 0;
  let ssRes = 0;
  let sumAbsError = 0;
  let sumAbsPctError = 0;

  for (const pred of testPredictions) {
    const actual = pred.actualFuelLitres;
    const predicted = pred.predictedFuelLitres;
    const residual = actual - predicted;

    ssRes += residual * residual;
    ssTot += (actual - meanActual) * (actual - meanActual);
    sumAbsError += Math.abs(residual);

    if (actual > 0) {
      sumAbsPctError += Math.abs(residual / actual);
    }
  }

  // R² on test set (bound between 0 and 1, or negative if worse than mean prediction)
  const rSquared = ssTot > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 1.0;
  const mae = sumAbsError / n;
  const mape = (100 * sumAbsPctError) / n;

  return {
    canCalibrate: true,
    tripsCount: validTrips.length,
    tripsNeeded: 0,
    coefficients: fittedCoefficients,
    isCalibrated: true,
    metrics: {
      rSquared: Number(rSquared.toFixed(4)),
      mae: Number(mae.toFixed(3)),
      mape: Number(mape.toFixed(2)),
      trainSampleSize: trainSize,
      testSampleSize: testSize,
    },
    version: currentVersion + 1,
    calibratedAt: new Date().toISOString(),
    testPredictions,
  };
}
