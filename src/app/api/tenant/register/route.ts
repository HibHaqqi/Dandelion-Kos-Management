import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, nik } = body;

    // Validation
    if (!name || name.length < 3) {
      return NextResponse.json(
        { error: 'Name must be at least 3 characters' },
        { status: 400 }
      );
    }

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

    if (!nik || nik.length < 16) {
      return NextResponse.json(
        { error: 'NIK must be at least 16 digits' },
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

    // Find customer by NIK (must exist and belong to admin)
    const customer = await prisma.customer.findUnique({
      where: { nik },
      include: { user: true }, // Get the admin user
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'NIK not found. Please contact your property owner.' },
        { status: 404 }
      );
    }

    // Check if customer already has a tenant account
    const existingTenant = await prisma.tenant.findUnique({
      where: { customerId: customer.id },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'This NIK already has a tenant account' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with TENANT role
    const user = await prisma.user.create({
      data: {
        name,
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
        message: 'Tenant account created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          customerName: customer.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Tenant registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
