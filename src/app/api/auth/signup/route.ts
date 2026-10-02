import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import { POPULATION_BASELINE_COEFFICIENTS } from '@/lib/fuelModel';

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  unitSystem: z.enum(['metric', 'imperial']).default('metric'),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = SignupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { name, email, password, unitSystem, currency } = result.data;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        unitSystem,
        currency,
        defaultFuelPrice: currency === 'INR' ? 102.5 : currency === 'USD' ? 1.05 : 1.75,
      },
      select: {
        id: true,
        email: true,
        name: true,
        unitSystem: true,
        currency: true,
        defaultFuelPrice: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
