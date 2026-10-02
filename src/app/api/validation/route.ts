import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get('vehicleId');

  const whereClause: any = { userId: user.id };
  if (vehicleId) whereClause.vehicleId = vehicleId;

  const trips = await prisma.tripLog.findMany({
    where: whereClause,
    include: {
      vehicle: { select: { id: true, name: true, make: true, model: true } },
    },
    orderBy: { date: 'asc' },
  });

  if (trips.length === 0) {
    return NextResponse.json({
      tripsCount: 0,
      points: [],
      metrics: { rSquared: 0, mae: 0, mape: 0, meanError: 0 },
      residualsHistogram: [],
    });
  }

  const points = trips.map((t) => {
    const predicted = t.predictedFuelLitres ?? (t.distanceKm / (t.vehicle ? 15.0 : 15.0));
    const error = t.fuelUsedLitres - predicted;
    const absError = Math.abs(error);
    const absPctError = t.fuelUsedLitres > 0 ? (absError / t.fuelUsedLitres) * 100 : 0;

    return {
      tripId: t.id,
      tripName: t.tripName,
      vehicleId: t.vehicleId,
      vehicleName: t.vehicle.name,
      distanceKm: t.distanceKm,
      actualFuelLitres: Number(t.fuelUsedLitres.toFixed(3)),
      predictedFuelLitres: Number(predicted.toFixed(3)),
      errorLitres: Number(error.toFixed(3)),
      absErrorLitres: Number(absError.toFixed(3)),
      absPctError: Number(absPctError.toFixed(2)),
      date: t.date.toISOString().split('T')[0],
      avgSpeedKmh: t.avgSpeedKmh,
    };
  });

  const n = points.length;
  const actualValues = points.map((p) => p.actualFuelLitres);
  const meanActual = actualValues.reduce((acc, v) => acc + v, 0) / n;

  let ssTot = 0;
  let ssRes = 0;
  let sumAbsError = 0;
  let sumAbsPctError = 0;
  let sumError = 0;

  for (const p of points) {
    const residual = p.actualFuelLitres - p.predictedFuelLitres;
    ssRes += residual * residual;
    ssTot += (p.actualFuelLitres - meanActual) * (p.actualFuelLitres - meanActual);
    sumAbsError += Math.abs(residual);
    sumError += residual;
    if (p.actualFuelLitres > 0) {
      sumAbsPctError += Math.abs(residual / p.actualFuelLitres);
    }
  }

  const rSquared = ssTot > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 1.0;
  const mae = sumAbsError / n;
  const mape = (100 * sumAbsPctError) / n;
  const meanError = sumError / n;

  // Build error distribution histogram buckets
  const bins = [
    { label: '< -0.5L', min: -Infinity, max: -0.5, count: 0 },
    { label: '-0.5L to -0.2L', min: -0.5, max: -0.2, count: 0 },
    { label: '-0.2L to 0.0L', min: -0.2, max: 0.0, count: 0 },
    { label: '0.0L to +0.2L', min: 0.0, max: 0.2, count: 0 },
    { label: '+0.2L to +0.5L', min: 0.2, max: 0.5, count: 0 },
    { label: '> +0.5L', min: 0.5, max: Infinity, count: 0 },
  ];

  for (const p of points) {
    for (const b of bins) {
      if (p.errorLitres >= b.min && p.errorLitres < b.max) {
        b.count++;
        break;
      }
    }
  }

  return NextResponse.json({
    tripsCount: n,
    points,
    metrics: {
      rSquared: Number(rSquared.toFixed(4)),
      mae: Number(mae.toFixed(3)),
      mape: Number(mape.toFixed(2)),
      meanError: Number(meanError.toFixed(3)),
    },
    residualsHistogram: bins.map((b) => ({ label: b.label, count: b.count })),
  });
}
