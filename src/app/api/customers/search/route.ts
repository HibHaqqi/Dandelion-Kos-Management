import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Search for customers by email (case-insensitive partial match)
    const customers = await prisma.customer.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive',
        },
      },
      include: {
        Tenant: true, // Check if already linked to a tenant account
      },
      take: 10, // Limit results
    });

    // Filter out customers that already have a tenant account
    const availableCustomers = customers.filter((c) => !c.Tenant);

    return NextResponse.json({
      customers: availableCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        nik: c.nik,
        roomNumber: c.roomNumber,
      })),
    });
  } catch (error) {
    console.error('Customer search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
