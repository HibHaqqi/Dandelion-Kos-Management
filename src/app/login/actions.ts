'use server';

import { redirect } from 'next/navigation';
import { createSession, destroySession } from '@/lib/session';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function login(
  prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      tenantProfile: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    // Prepare session data based on role
    const role = user.role as 'ADMIN' | 'TENANT';
    let customerId: string | undefined;
    let tenantId: string | undefined;

    if (role === 'TENANT' && user.tenantProfile) {
      customerId = user.tenantProfile.customerId;
      tenantId = user.tenantProfile.id;

      // Check if tenant account is active
      if (!user.tenantProfile.active) {
        return { error: 'Your tenant account has been deactivated. Please contact admin.' };
      }
    }

    // Create session with role and tenant info
    await createSession(user.id, role, customerId, tenantId);

    // Role-based redirect
    if (role === 'TENANT') {
      redirect('/tenant/dashboard');
    } else {
      redirect('/');
    }
  }

  return { error: 'Invalid email or password.' };
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
