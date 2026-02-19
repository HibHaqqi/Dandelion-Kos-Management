import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, customerId } = body;

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if customer exists and is not already linked
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { Tenant: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer record not found' },
        { status: 404 }
      );
    }

    if (customer.Tenant) {
      return NextResponse.json(
        { error: 'This customer record is already linked to a tenant account' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with TENANT role
    const user = await prisma.user.create({
      data: {
        name: customer.name,
        email,
        password: hashedPassword,
        role: 'TENANT',
      },
    });

    // Create tenant profile linking User ↔ Customer
    const tenant = await prisma.tenant.create({
      data: {
        userId: user.id,
        customerId: customer.id,
        active: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Tenant account created and linked successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          customerName: customer.name,
          customerRoomNumber: customer.roomNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Tenant link registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
