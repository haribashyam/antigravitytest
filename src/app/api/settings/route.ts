import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const UpdateSettingsSchema = z.object({
  unitSystem: z.enum(['metric', 'imperial']).optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
  fuelPriceSource: z.enum(['manual', 'api']).optional(),
  defaultFuelPrice: z.number().positive().optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    settings: {
      unitSystem: user.unitSystem,
      currency: user.currency,
      fuelPriceSource: user.fuelPriceSource,
      defaultFuelPrice: user.defaultFuelPrice,
    },
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = UpdateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
      select: {
        id: true,
        email: true,
        name: true,
        unitSystem: true,
        currency: true,
        fuelPriceSource: true,
        defaultFuelPrice: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error('Update settings error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
