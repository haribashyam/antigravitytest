import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import {
  predictFuelConsumption,
  POPULATION_BASELINE_COEFFICIENTS,
  TripInput,
} from '@/lib/fuelModel';
import { calibrateVehicleCoefficients, TripRecord } from '@/lib/regression';

const LogTripSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  tripName: z.string().min(1, 'Trip name / route is required'),
  origin: z.string().optional(),
  destination: z.string().optional(),
  distanceKm: z.number().positive('Distance must be greater than 0 km'),
  fuelUsedLitres: z.number().positive('Fuel used must be greater than 0 Litres'),
  avgSpeedKmh: z.number().positive('Average speed must be greater than 0 km/h'),
  trafficIntensity: z.number().min(0).max(1).default(0),
  loadRatio: z.number().min(0).max(1).default(0),
  hardAccelEvents: z.number().int().min(0).default(0),
  hardBrakeEvents: z.number().int().min(0).default(0),
  gradientDecimal: z.number().default(0),
  idleMinutes: z.number().min(0).default(0),
  fuelPricePerLitre: z.number().positive('Fuel price must be positive'),
  dataSource: z.enum(['manual', 'gps_live', 'api_routed']).default('manual'),
  notes: z.string().optional(),
  date: z.string().optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get('vehicleId');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  const whereClause: any = { userId: user.id };
  if (vehicleId) whereClause.vehicleId = vehicleId;
  if (search) {
    whereClause.OR = [
      { tripName: { contains: search } },
      { origin: { contains: search } },
      { destination: { contains: search } },
    ];
  }

  const trips = await prisma.tripLog.findMany({
    where: whereClause,
    include: {
      vehicle: {
        select: { id: true, name: true, make: true, model: true, m0: true },
      },
    },
    orderBy: { date: 'desc' },
    take: limit,
  });

  return NextResponse.json({ trips });
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = LogTripSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify vehicle belongs to user
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, userId: user.id },
      include: {
        coefficientSets: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Active coefficients for this vehicle
    const activeCoeffs = vehicle.coefficientSets[0] || {
      ...POPULATION_BASELINE_COEFFICIENTS,
      version: 1,
    };

    // Calculate aggressive factor
    const aggressiveFactor =
      data.distanceKm > 0
        ? (data.hardAccelEvents + data.hardBrakeEvents) / data.distanceKm
        : 0;

    // Predict fuel consumption with active model
    const input: TripInput = {
      distanceKm: data.distanceKm,
      baseMileageKmPerL: vehicle.m0,
      avgSpeedKmh: data.avgSpeedKmh,
      trafficIntensity: data.trafficIntensity,
      loadRatio: data.loadRatio,
      aggressiveFactor,
      gradientDecimal: data.gradientDecimal,
      idleMinutes: data.idleMinutes,
    };

    const pred = predictFuelConsumption(input, {
      kv: activeCoeffs.kv,
      kt: activeCoeffs.kt,
      kl: activeCoeffs.kl,
      ka: activeCoeffs.ka,
      kg: activeCoeffs.kg,
      ki: activeCoeffs.ki,
    });

    const predictedFuelLitres = Number(pred.totalFuelLiters.toFixed(3));
    const actualCost = Number((data.fuelUsedLitres * data.fuelPricePerLitre).toFixed(2));
    const predictedCost = Number((predictedFuelLitres * data.fuelPricePerLitre).toFixed(2));

    // Save trip log
    const trip = await prisma.tripLog.create({
      data: {
        vehicleId: vehicle.id,
        userId: user.id,
        tripName: data.tripName,
        origin: data.origin,
        destination: data.destination,
        distanceKm: data.distanceKm,
        fuelUsedLitres: data.fuelUsedLitres,
        predictedFuelLitres,
        avgSpeedKmh: data.avgSpeedKmh,
        trafficIntensity: data.trafficIntensity,
        loadRatio: data.loadRatio,
        hardAccelEvents: data.hardAccelEvents,
        hardBrakeEvents: data.hardBrakeEvents,
        aggressiveFactor,
        gradientDecimal: data.gradientDecimal,
        idleMinutes: data.idleMinutes,
        fuelPricePerLitre: data.fuelPricePerLitre,
        actualCost,
        predictedCost,
        dataSource: data.dataSource,
        notes: data.notes,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    // Auto-calibration check:
    // Fetch all trips for this vehicle to see if we can calibrate/recalibrate
    const allTrips = await prisma.tripLog.findMany({
      where: { vehicleId: vehicle.id },
      orderBy: { date: 'asc' },
    });

    let recalibrated = false;
    let newCoefficientSet = null;

    if (allTrips.length >= 8) {
      const records: TripRecord[] = allTrips.map((t) => ({
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

      const calibration = calibrateVehicleCoefficients(
        records,
        vehicle.m0,
        activeCoeffs.version
      );

      if (calibration.canCalibrate && calibration.metrics) {
        newCoefficientSet = await prisma.coefficientSet.create({
          data: {
            vehicleId: vehicle.id,
            version: calibration.version,
            kv: calibration.coefficients.kv,
            kt: calibration.coefficients.kt,
            kl: calibration.coefficients.kl,
            ka: calibration.coefficients.ka,
            kg: calibration.coefficients.kg,
            ki: calibration.coefficients.ki,
            isDefault: false,
            sampleSize: calibration.tripsCount,
            rSquared: calibration.metrics.rSquared,
            mae: calibration.metrics.mae,
            mape: calibration.metrics.mape,
            notes: `Auto-calibrated via OLS from ${calibration.tripsCount} stored trip logs.`,
          },
        });
        recalibrated = true;
      }
    }

    return NextResponse.json({
      success: true,
      trip,
      recalibrated,
      activeCoefficients: newCoefficientSet || activeCoeffs,
      tripsTotal: allTrips.length,
    });
  } catch (err: any) {
    console.error('Trip logging error:', err);
    return NextResponse.json(
      { error: 'Failed to log trip: ' + (err.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
