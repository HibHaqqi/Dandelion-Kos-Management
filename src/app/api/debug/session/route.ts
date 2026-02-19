import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({
        message: 'No session found',
        session: null,
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        tenantProfile: {
          include: {
            customer: true,
          },
        },
      },
    });

    return NextResponse.json({
      session: {
        userId: session.userId,
        role: session.role,
        customerId: session.customerId,
        tenantId: session.tenantId,
        expires: session.expires,
      },
      userExists: !!user,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantProfile: user.tenantProfile ? {
          id: user.tenantProfile.id,
          active: user.tenantProfile.active,
          customerId: user.tenantProfile.customerId,
          customerName: user.tenantProfile.customer?.name,
        } : null,
      } : null,
    });
  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json(
      { error: 'Failed to debug session' },
      { status: 500 }
    );
  }
}
