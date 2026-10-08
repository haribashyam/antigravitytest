import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifyPassword, createSession, SESSION_COOKIE_NAME } from '@/lib/auth';

const LoginSchema = z.object({
  identifier: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { identifier, email, password } = result.data;
    const loginInput = (identifier || email || '').trim();

    if (!loginInput) {
      return NextResponse.json(
        { error: 'Please enter your email or username' },
        { status: 400 }
      );
    }

    const normalizedInput = loginInput.toLowerCase();
    const withoutAt = normalizedInput.startsWith('@') ? normalizedInput.slice(1) : normalizedInput;
    const rawWithoutAt = loginInput.startsWith('@') ? loginInput.slice(1) : loginInput;

    // Query user by email, username, handle without @, or display name
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedInput },
          { email: withoutAt },
          { username: normalizedInput },
          { username: withoutAt },
          { name: loginInput },
          { name: rawWithoutAt },
        ],
      },
    });

    // Fallback: check case-insensitive match for name and username across accounts
    if (!user) {
      const allUsers = await prisma.user.findMany({
        take: 100,
      });
      user =
        allUsers.find((u) => {
          const uEmail = u.email.toLowerCase();
          const uUsername = u.username ? u.username.toLowerCase() : '';
          const uName = u.name.toLowerCase();
          return (
            uEmail === normalizedInput ||
            uEmail === withoutAt ||
            uUsername === normalizedInput ||
            uUsername === withoutAt ||
            uName === normalizedInput ||
            uName === withoutAt
          );
        }) || null;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account found matching that email or username. Please check your credentials or create an account.' },
        { status: 401 }
      );
    }

    let isValid = await verifyPassword(password, user.passwordHash);
    // If exact password doesn't match and there is leading/trailing space, test trimmed
    if (!isValid && password.trim() !== password) {
      isValid = await verifyPassword(password.trim(), user.passwordHash);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password. Please check your password and try again.' },
        { status: 401 }
      );
    }

    const { token, cookieOptions } = await createSession(user.id);

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        unitSystem: user.unitSystem,
        currency: user.currency,
        fuelPriceSource: user.fuelPriceSource,
        defaultFuelPrice: user.defaultFuelPrice,
      },
      token,
    });

    // Set cookie directly on response object for reliable delivery
    response.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
