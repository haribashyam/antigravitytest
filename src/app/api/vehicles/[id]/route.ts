import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const UpdateVehicleSchema = z.object({
  name: z.string().min(2).optional(),
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1980).max(2027).optional(),
  fuelType: z.enum(['petrol', 'diesel', 'cng', 'hybrid', 'electric']).optional(),
  m0: z.number().positive().optional(),
  ratedPayloadKg: z.number().positive().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const vehicle = await prisma.vehicle.findFirst({
    where: { id, userId: user.id },
    include: {
      coefficientSets: {
        orderBy: { version: 'desc' },
      },
      tripLogs: {
        orderBy: { date: 'desc' },
        take: 50,
      },
      _count: { select: { tripLogs: true } },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  return NextResponse.json({ vehicle });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateVehicleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Validation error' },
      { status: 400 }
    );
  }

  const existing = await prisma.vehicle.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  const updated = await prisma.vehicle.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ success: true, vehicle: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.vehicle.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  await prisma.vehicle.delete({ where: { id } });

  return NextResponse.json({ success: true, message: 'Vehicle deleted' });
}
