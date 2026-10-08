import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get('vehicleId');

  const whereClause: any = { userId: user.id };
  if (vehicleId) whereClause.vehicleId = vehicleId;

  const trips = await prisma.tripLog.findMany({
    where: whereClause,
    include: {
      vehicle: { select: { name: true, make: true, model: true, m0: true } },
    },
    orderBy: { date: 'desc' },
  });

  // Construct CSV Header with units explicitly designated
  const headers = [
    'Trip ID',
    'Date',
    'Vehicle',
    'Trip Name',
    'Origin',
    'Destination',
    'Distance (km)',
    'Actual Fuel (L)',
    'Predicted Fuel (L)',
    'Fuel Difference (L)',
    'Percentage Error (%)',
    'Average Speed (km/h)',
    'Traffic Intensity (0-1)',
    'Payload Ratio (0-1)',
    'Hard Accel Events',
    'Hard Brake Events',
    'Aggressive Factor (events/km)',
    'Gradient Decimal',
    'Idle Time (min)',
    'Fuel Price per Litre',
    'Actual Cost',
    'Data Source',
  ];

  const rows = trips.map((t) => {
    const diff = t.predictedFuelLitres != null ? t.fuelUsedLitres - t.predictedFuelLitres : 0;
    const pctErr =
      t.fuelUsedLitres > 0 && t.predictedFuelLitres != null
        ? ((diff / t.fuelUsedLitres) * 100).toFixed(2)
        : 'N/A';

    return [
      `"${t.id}"`,
      `"${t.date.toISOString().split('T')[0]}"`,
      `"${t.vehicle.name}"`,
      `"${t.tripName.replace(/"/g, '""')}"`,
      `"${(t.origin || '').replace(/"/g, '""')}"`,
      `"${(t.destination || '').replace(/"/g, '""')}"`,
      t.distanceKm.toFixed(2),
      t.fuelUsedLitres.toFixed(3),
      t.predictedFuelLitres != null ? t.predictedFuelLitres.toFixed(3) : 'N/A',
      t.predictedFuelLitres != null ? diff.toFixed(3) : 'N/A',
      pctErr,
      t.avgSpeedKmh.toFixed(1),
      t.trafficIntensity.toFixed(2),
      t.loadRatio.toFixed(2),
      t.hardAccelEvents,
      t.hardBrakeEvents,
      t.aggressiveFactor.toFixed(3),
      t.gradientDecimal.toFixed(4),
      t.idleMinutes.toFixed(1),
      t.fuelPricePerLitre.toFixed(2),
      t.actualCost.toFixed(2),
      `"${t.dataSource}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="fuelwise-trips-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
