import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

// GET - Fetch all room numbers (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all unique room numbers from Room table
    const rooms = await prisma.room.findMany({
      select: {
        roomNumber: true,
        status: true,
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });

    // Also get room numbers from customers who have rooms
    const customersWithRooms = await prisma.customer.findMany({
      where: {
        roomNumber: {
          not: null,
        },
      },
      select: {
        roomNumber: true,
      },
      distinct: ['roomNumber'],
    });

    // Combine and deduplicate room numbers
    const roomNumbersSet = new Set<string>();

    rooms.forEach((room) => {
      roomNumbersSet.add(room.roomNumber);
    });

    customersWithRooms.forEach((customer) => {
      if (customer.roomNumber) {
        roomNumbersSet.add(customer.roomNumber);
      }
    });

    // Convert to sorted array
    const roomNumbers = Array.from(roomNumbersSet).sort();

    // Add status information
    const roomsWithStatus = roomNumbers.map((roomNumber) => {
      const room = rooms.find((r) => r.roomNumber === roomNumber);
      return {
        roomNumber,
        status: room?.status || 'unknown',
      };
    });

    return NextResponse.json(roomsWithStatus);
  } catch (error) {
    console.error('Error fetching room list:', error);
    return NextResponse.json({ error: 'Failed to fetch room list' }, { status: 500 });
  }
}
