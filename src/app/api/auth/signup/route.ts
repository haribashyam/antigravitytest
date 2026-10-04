import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword, createSession, SESSION_COOKIE_NAME } from '@/lib/auth';

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscores, and dashes')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  unitSystem: z.enum(['metric', 'imperial']).default('metric'),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
  defaultFuelPrice: z.number().positive().optional(),
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

    const { name, username, email, password, unitSystem, currency, defaultFuelPrice } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          error: 'An account with this email address already exists. Please log in instead.',
          isExistingUser: true,
        },
        { status: 409 }
      );
    }

    // Determine clean username
    let cleanUsername = username?.trim().toLowerCase();
    if (!cleanUsername) {
      // Auto-derive from email prefix or name if not explicitly provided
      const baseCandidate = (normalizedEmail.split('@')[0] || name).toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      cleanUsername = baseCandidate.length >= 3 ? baseCandidate.slice(0, 24) : `user_${Date.now().toString().slice(-6)}`;
    }

    // Check if username is already taken; if collision, append unique digits
    const existingUsername = await prisma.user.findFirst({
      where: { username: cleanUsername },
    });

    if (existingUsername) {
      if (username) {
        return NextResponse.json(
          { error: `The username "${cleanUsername}" is already taken. Please choose a different one.` },
          { status: 409 }
        );
      } else {
        cleanUsername = `${cleanUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    const passwordHash = await hashPassword(password);
    const standardFuelPrice =
      defaultFuelPrice ||
      (currency === 'INR' ? 102.5 : currency === 'USD' ? 1.05 : currency === 'GBP' ? 1.45 : 1.75);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: normalizedEmail,
        passwordHash,
        unitSystem,
        currency,
        defaultFuelPrice: standardFuelPrice,
        fuelPriceSource: 'manual',
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        unitSystem: true,
        currency: true,
        defaultFuelPrice: true,
      },
    });

    // Create persistent session
    const { token, cookieOptions } = await createSession(user.id);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user,
        token,
      },
      { status: 201 }
    );

    // Set cookie on response object for bulletproof header propagation
    response.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
