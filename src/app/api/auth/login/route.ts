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

    // Build comprehensive search candidates (including domain typo fixes and email local-part)
    const candidates = new Set<string>();
    candidates.add(normalizedInput);
    candidates.add(withoutAt);

    const domainFixes: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
    };

    if (normalizedInput.includes('@')) {
      const atIdx = normalizedInput.indexOf('@');
      const local = normalizedInput.slice(0, atIdx);
      const domain = normalizedInput.slice(atIdx + 1);

      if (local) {
        candidates.add(local); // e.g. "haribashyam.11"
      }

      if (domainFixes[domain]) {
        candidates.add(`${local}@${domainFixes[domain]}`);
      }
      for (const [typo, fixed] of Object.entries(domainFixes)) {
        if (domain === fixed) {
          candidates.add(`${local}@${typo}`);
        }
      }
    } else {
      // If user typed only the username/prefix (e.g. "haribashyam.11"), also check as gmail candidate
      candidates.add(`${normalizedInput}@gmail.com`);
    }

    const orConditions: any[] = [];
    for (const c of candidates) {
      orConditions.push({ email: c });
      orConditions.push({ username: c });
    }
    orConditions.push({ name: loginInput });
    orConditions.push({ name: rawWithoutAt });

    // Query user in database
    let user = await prisma.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    // Fallback: check case-insensitive match for email local-part, email, username, and display name across accounts
    if (!user) {
      const allUsers = await prisma.user.findMany({
        take: 200,
      });

      user =
        allUsers.find((u) => {
          const uEmail = u.email.toLowerCase();
          const uEmailLocal = uEmail.split('@')[0];
          const uUsername = u.username ? u.username.toLowerCase() : '';
          const uName = u.name.toLowerCase();

          for (const c of candidates) {
            if (
              c === uEmail ||
              c === uEmailLocal ||
              c === uUsername ||
              c === uName
            ) {
              return true;
            }
          }
          return (
            loginInput.toLowerCase() === uName ||
            (loginInput.startsWith('@') && loginInput.slice(1).toLowerCase() === uName)
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
