import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.tenantId) {
      return NextResponse.json(
        { error: 'Tenant profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { category, title, description, imageUrl } = body;

    // Validation
    const validCategories = [
      'ELECTRICITY',
      'PLUMBING',
      'INTERNET',
      'CLEANING',
      'SECURITY',
      'OTHER',
    ];

    if (!category || !validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    if (!title || title.length < 5) {
      return NextResponse.json(
        { error: 'Title must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (!description || description.length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        tenantId: session.tenantId,
        category,
        title,
        description,
        imageUrl: imageUrl || null,
        status: 'OPEN',
      },
    });

    revalidatePath('/tenant/complaints');

    return NextResponse.json(
      {
        message: 'Complaint created successfully',
        complaint: {
          id: complaint.id,
          title: complaint.title,
          category: complaint.category,
          status: complaint.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Complaint creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.tenantId) {
      return NextResponse.json(
        { error: 'Tenant profile not found' },
        { status: 404 }
      );
    }

    // Get tenant's complaints
    const complaints = await prisma.complaint.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Complaint fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
