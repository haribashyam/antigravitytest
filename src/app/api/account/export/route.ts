import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const fullData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      unitSystem: true,
      currency: true,
      fuelPriceSource: true,
      defaultFuelPrice: true,
      createdAt: true,
      vehicles: {
        include: {
          coefficientSets: true,
          tripLogs: true,
        },
      },
    },
  });

  return new Response(JSON.stringify(fullData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="fuelwise-account-export-${user.id}.json"`,
    },
  });
}
