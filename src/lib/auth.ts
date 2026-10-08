import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './db';

export const SESSION_COOKIE_NAME = 'fuelwise_session';
export const SESSION_DURATION_DAYS = 30;

export function getSessionCookieOptions(expiresAt: Date) {
  // Use secure cookies only when HTTPS is actually present (e.g. Vercel / Railway / production HTTPS)
  // This prevents localhost / plain HTTP environments from silently dropping the cookie.
  const isSecureProduction =
    process.env.NODE_ENV === 'production' &&
    Boolean(
      process.env.VERCEL ||
      process.env.NEXT_PUBLIC_VERCEL_ENV ||
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RENDER ||
      process.env.SECURE_COOKIES === 'true' ||
      process.env.NEXTAUTH_URL?.startsWith('https://')
    );

  return {
    httpOnly: true,
    secure: isSecureProduction,
    sameSite: 'lax' as const,
    expires: expiresAt,
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: '/',
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date; cookieOptions: any }> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieOptions = getSessionCookieOptions(expiresAt);

  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, cookieOptions);
  } catch (err) {
    // cookies() might be unavailable if called in certain Next.js server contexts
  }

  return { token, expiresAt, cookieOptions };
}

export async function getCurrentUser(req?: Request) {
  try {
    let token: string | undefined;

    // 1. Prioritize reading directly from Request headers if passed (fast and immune to context loss)
    if (req) {
      const authHeader = req.headers.get('authorization') || req.headers.get('x-session-token');
      if (authHeader) {
        token = authHeader.replace(/^Bearer\s+/i, '').trim();
      }
      if (!token) {
        const cookieHeader = req.headers.get('cookie');
        if (cookieHeader) {
          const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
          if (match) {
            token = decodeURIComponent(match[1]);
          }
        }
      }
    }

    // 2. Try reading from Next.js cookie store
    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      } catch {}
    }

    // 3. Try reading from Next.js header list
    if (!token) {
      try {
        const { headers } = await import('next/headers');
        const headerList = await headers();
        const authHeader = headerList.get('authorization') || headerList.get('x-session-token');
        if (authHeader) {
          token = authHeader.replace(/^Bearer\s+/i, '').trim();
        }
      } catch {}
    }

    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            unitSystem: true,
            currency: true,
            fuelPriceSource: true,
            defaultFuelPrice: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session) return null;

    if (session.expiresAt < new Date()) {
      try {
        await prisma.session.delete({ where: { token } });
      } catch {}
      return null;
    }

    return session.user;
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}

export async function destroySession(): Promise<any> {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      try {
        await prisma.session.deleteMany({ where: { token } });
      } catch {}
    }

    cookieStore.set(SESSION_COOKIE_NAME, '', cookieOptions);
  } catch {}

  return cookieOptions;
}
