import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customers: true,
        tenantProfile: {
          include: {
            customer: true, // Fetch customer through tenant relationship
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // TODO: In production, verify password hash
    // For now, we'll just check if user exists
    // You should add: const isValidPassword = await bcrypt.compare(password, user.password);

    // Get customer based on role
    let customer = null;

    if (user.role === 'TENANT' && user.tenantProfile) {
      // For TENANT: Get customer through tenant profile relationship
      customer = user.tenantProfile.customer;
    } else if (user.role === 'ADMIN' && user.customers && user.customers.length > 0) {
      // For ADMIN: Get first customer (if any)
      customer = user.customers[0];
    }

    // Debug logging
    console.log('User login attempt:', {
      email: user.email,
      role: user.role,
      customerId: customer?.id,
      tenantId: user.tenantProfile?.id,
      customerRoomNumber: customer?.roomNumber,
      hasCustomers: user.customers?.length || 0,
      hasTenantProfile: !!user.tenantProfile,
    });

    // Create session
    await createSession(
      user.id,
      user.role,
      customer?.id,
      user.tenantProfile?.id
    );

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        customerId: customer?.id,
        tenantId: user.tenantProfile?.id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
