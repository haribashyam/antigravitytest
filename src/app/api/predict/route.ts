import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import {
  predictFuelConsumption,
  calculateTripCost,
  POPULATION_BASELINE_COEFFICIENTS,
  TripInput,
} from '@/lib/fuelModel';
import { resolveFuelPrice } from '@/lib/dataSources';

const PredictSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  distanceKm: z.number().positive('Distance must be greater than 0 km'),
  avgSpeedKmh: z.number().positive('Average speed must be greater than 0 km/h'),
  trafficIntensity: z.number().min(0).max(1).default(0),
  loadRatio: z.number().min(0).max(1).default(0),
  aggressiveFactor: z.number().min(0).default(0),
  gradientDecimal: z.number().default(0),
  idleMinutes: z.number().min(0).default(0),
  fuelPricePerLitre: z.number().optional(),
  currency: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const parsed = PredictSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      include: {
        coefficientSets: { orderBy: { version: 'desc' }, take: 1 },
        _count: { select: { tripLogs: true } },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const activeCoefficients = vehicle.coefficientSets[0] || {
      ...POPULATION_BASELINE_COEFFICIENTS,
      isDefault: true,
      version: 1,
      sampleSize: 0,
    };

    const input: TripInput = {
      distanceKm: data.distanceKm,
      baseMileageKmPerL: vehicle.m0,
      avgSpeedKmh: data.avgSpeedKmh,
      trafficIntensity: data.trafficIntensity,
      loadRatio: data.loadRatio,
      aggressiveFactor: data.aggressiveFactor,
      gradientDecimal: data.gradientDecimal,
      idleMinutes: data.idleMinutes,
    };

    const prediction = predictFuelConsumption(input, {
      kv: activeCoefficients.kv,
      kt: activeCoefficients.kt,
      kl: activeCoefficients.kl,
      ka: activeCoefficients.ka,
      kg: activeCoefficients.kg,
      ki: activeCoefficients.ki,
    });

    const currency = data.currency || user?.currency || 'INR';
    const fuelPriceResult = await resolveFuelPrice(
      data.fuelPricePerLitre || user?.defaultFuelPrice,
      currency
    );

    const costBreakdown = calculateTripCost(
      prediction,
      data.distanceKm,
      fuelPriceResult.pricePerLitre,
      currency
    );

    return NextResponse.json({
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        make: vehicle.make,
        model: vehicle.model,
        m0: vehicle.m0,
        tripCount: vehicle._count.tripLogs,
      },
      modelStatus: {
        isPersonalized: !activeCoefficients.isDefault && vehicle._count.tripLogs >= 8,
        version: activeCoefficients.version,
        sampleSize: activeCoefficients.sampleSize,
        tripsNeeded: Math.max(0, 8 - vehicle._count.tripLogs),
        label: !activeCoefficients.isDefault && vehicle._count.tripLogs >= 8
          ? `Personal Model (v${activeCoefficients.version} calibrated on ${activeCoefficients.sampleSize} trips)`
          : `Population Engineering Baseline (${Math.max(0, 8 - vehicle._count.tripLogs)} more trips needed)`,
      },
      fuelPriceInfo: fuelPriceResult,
      breakdown: costBreakdown,
    });
  } catch (err: any) {
    console.error('Prediction API error:', err);
    return NextResponse.json(
      { error: err.message || 'Calculation error' },
      { status: 500 }
    );
  }
}
