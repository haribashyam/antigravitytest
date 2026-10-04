import { NextResponse } from 'next/server';
import { destroySession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const cookieOptions = await destroySession();
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set(SESSION_COOKIE_NAME, '', cookieOptions);
  return response;
}
