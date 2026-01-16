'use server';

import { cookies } from 'next/headers';

// Types for session data
export interface SessionData {
  userId: string;
  role: 'ADMIN' | 'TENANT';
  customerId?: string; // Only for TENANT role
  tenantId?: string;    // Only for TENANT role
  expires: Date;
}

export async function createSession(
  userId: string,
  role: 'ADMIN' | 'TENANT',
  customerId?: string,
  tenantId?: string
) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session: SessionData = {
    userId,
    role,
    customerId,
    tenantId,
    expires,
  };

  const cookieStore = await cookies();
  cookieStore.set('session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) return null;

  const session = JSON.parse(sessionCookie);
  // Convert expires string back to Date object
  session.expires = new Date(session.expires);
  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
