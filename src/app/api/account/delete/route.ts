import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, destroySession } from '@/lib/auth';

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Delete user account (cascades to vehicles, trips, coefficients, sessions)
  await prisma.user.delete({
    where: { id: user.id },
  });

  await destroySession();

  return NextResponse.json({ success: true, message: 'Account permanently deleted' });
}
