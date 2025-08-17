import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData, type DateFilterValue } from '@/app/dashboard.logic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dateFilter } = body as { dateFilter?: DateFilterValue };

    const dashboardData = await getDashboardData(dateFilter);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dashboardData = await getDashboardData();
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}