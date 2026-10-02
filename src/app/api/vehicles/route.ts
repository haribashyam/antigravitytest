import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { POPULATION_BASELINE_COEFFICIENTS } from '@/lib/fuelModel';

const CreateVehicleSchema = z.object({
  name: z.string().min(2, 'Vehicle name must be at least 2 characters'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1980).max(2027),
  fuelType: z.enum(['petrol', 'diesel', 'cng', 'hybrid', 'electric']).default('petrol'),
  m0: z.number().positive('Base mileage M0 must be strictly greater than 0 km/L'),
  ratedPayloadKg: z.number().positive('Rated payload must be positive in kg').default(450.0),
  notes: z.string().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: user.id },
    include: {
      coefficientSets: {
        orderBy: { version: 'desc' },
        take: 1,
      },
      _count: {
        select: { tripLogs: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedVehicles = vehicles.map((v) => {
    const activeCoefficients = v.coefficientSets[0] || {
      ...POPULATION_BASELINE_COEFFICIENTS,
      isDefault: true,
      version: 1,
      sampleSize: 0,
      rSquared: null,
      mae: null,
      mape: null,
    };

    return {
      id: v.id,
      name: v.name,
      make: v.make,
      model: v.model,
      year: v.year,
      fuelType: v.fuelType,
      m0: v.m0,
      ratedPayloadKg: v.ratedPayloadKg,
      notes: v.notes,
      tripCount: v._count.tripLogs,
      activeCoefficients,
      isCalibrated: !activeCoefficients.isDefault && (v._count.tripLogs >= 8),
      createdAt: v.createdAt,
    };
  });

  return NextResponse.json({ vehicles: formattedVehicles });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = CreateVehicleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { name, make, model, year, fuelType, m0, ratedPayloadKg, notes } = result.data;

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: user.id,
        name,
        make,
        model,
        year,
        fuelType,
        m0,
        ratedPayloadKg,
        notes,
      },
    });

    // Create initial engineering baseline coefficient set (v1, default)
    await prisma.coefficientSet.create({
      data: {
        vehicleId: vehicle.id,
        version: 1,
        kv: POPULATION_BASELINE_COEFFICIENTS.kv,
        kt: POPULATION_BASELINE_COEFFICIENTS.kt,
        kl: POPULATION_BASELINE_COEFFICIENTS.kl,
        ka: POPULATION_BASELINE_COEFFICIENTS.ka,
        kg: POPULATION_BASELINE_COEFFICIENTS.kg,
        ki: POPULATION_BASELINE_COEFFICIENTS.ki,
        isDefault: true,
        sampleSize: 0,
        notes: 'Population Engineering Baseline. Awaiting 8 logged trips for personal calibration.',
      },
    });

    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (err: any) {
    console.error('Create vehicle error:', err);
    return NextResponse.json(
      { error: 'Failed to create vehicle.' },
      { status: 500 }
    );
  }
}
