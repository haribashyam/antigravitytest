import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { calibrateVehicleCoefficients, TripRecord } from '@/lib/regression';
import { POPULATION_BASELINE_COEFFICIENTS, MIN_TRIPS_FOR_CALIBRATION } from '@/lib/fuelModel';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { vehicleId } = await params;

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    include: {
      coefficientSets: { orderBy: { version: 'desc' } },
      tripLogs: { orderBy: { date: 'asc' } },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  const trips = vehicle.tripLogs;
  const activeCoefficients = vehicle.coefficientSets[0] || {
    ...POPULATION_BASELINE_COEFFICIENTS,
    version: 1,
    isDefault: true,
    sampleSize: 0,
    rSquared: null,
    mae: null,
    mape: null,
    notes: 'Population Engineering Baseline',
    createdAt: vehicle.createdAt,
  };

  const tripsCount = trips.length;
  const canCalibrate = tripsCount >= MIN_TRIPS_FOR_CALIBRATION;
  const tripsNeeded = Math.max(0, MIN_TRIPS_FOR_CALIBRATION - tripsCount);

  // Convert stored trip rows to regression format
  const records: TripRecord[] = trips.map((t) => ({
    id: t.id,
    vehicleId: t.vehicleId,
    distanceKm: t.distanceKm,
    fuelUsedLitres: t.fuelUsedLitres,
    avgSpeedKmh: t.avgSpeedKmh,
    trafficIntensity: t.trafficIntensity,
    loadRatio: t.loadRatio,
    hardAccelEvents: t.hardAccelEvents,
    hardBrakeEvents: t.hardBrakeEvents,
    aggressiveFactor: t.aggressiveFactor,
    gradientDecimal: t.gradientDecimal,
    idleMinutes: t.idleMinutes,
    createdAt: t.date,
  }));

  // Run OLS evaluation on current data to extract holdout points & fresh metrics
  let currentMetrics = null;
  let testPredictions = null;
  if (canCalibrate) {
    const freshEval = calibrateVehicleCoefficients(records, vehicle.m0, activeCoefficients.version);
    currentMetrics = freshEval.metrics;
    testPredictions = freshEval.testPredictions;
  }

  return NextResponse.json({
    vehicle: {
      id: vehicle.id,
      name: vehicle.name,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      m0: vehicle.m0,
    },
    tripsCount,
    canCalibrate,
    tripsNeeded,
    activeCoefficients,
    coefficientHistory: vehicle.coefficientSets,
    metrics: currentMetrics || {
      rSquared: activeCoefficients.rSquared,
      mae: activeCoefficients.mae,
      mape: activeCoefficients.mape,
    },
    testPredictions,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { vehicleId } = await params;

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    include: {
      coefficientSets: { orderBy: { version: 'desc' }, take: 1 },
      tripLogs: { orderBy: { date: 'asc' } },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  const trips = vehicle.tripLogs;
  if (trips.length < MIN_TRIPS_FOR_CALIBRATION) {
    return NextResponse.json(
      {
        error: `Cannot calibrate: Need at least ${MIN_TRIPS_FOR_CALIBRATION} trips (currently have ${trips.length}).`,
        tripsNeeded: MIN_TRIPS_FOR_CALIBRATION - trips.length,
      },
      { status: 400 }
    );
  }

  const currentVersion = vehicle.coefficientSets[0]?.version || 1;

  const records: TripRecord[] = trips.map((t) => ({
    id: t.id,
    vehicleId: t.vehicleId,
    distanceKm: t.distanceKm,
    fuelUsedLitres: t.fuelUsedLitres,
    avgSpeedKmh: t.avgSpeedKmh,
    trafficIntensity: t.trafficIntensity,
    loadRatio: t.loadRatio,
    hardAccelEvents: t.hardAccelEvents,
    hardBrakeEvents: t.hardBrakeEvents,
    aggressiveFactor: t.aggressiveFactor,
    gradientDecimal: t.gradientDecimal,
    idleMinutes: t.idleMinutes,
    createdAt: t.date,
  }));

  const result = calibrateVehicleCoefficients(records, vehicle.m0, currentVersion);

  if (!result.canCalibrate || !result.metrics) {
    return NextResponse.json(
      { error: 'Regression fitting failed to converge. Please verify trip data.' },
      { status: 500 }
    );
  }

  const newSet = await prisma.coefficientSet.create({
    data: {
      vehicleId: vehicle.id,
      version: result.version,
      kv: result.coefficients.kv,
      kt: result.coefficients.kt,
      kl: result.coefficients.kl,
      ka: result.coefficients.ka,
      kg: result.coefficients.kg,
      ki: result.coefficients.ki,
      isDefault: false,
      sampleSize: result.tripsCount,
      rSquared: result.metrics.rSquared,
      mae: result.metrics.mae,
      mape: result.metrics.mape,
      notes: `Manually recalibrated via OLS from ${result.tripsCount} stored trip logs.`,
    },
  });

  return NextResponse.json({
    success: true,
    newCoefficientSet: newSet,
    metrics: result.metrics,
  });
}
