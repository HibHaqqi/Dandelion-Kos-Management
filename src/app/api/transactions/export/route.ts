import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all transactions for the user, excluding userId
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        type: true,
        amount: true,
        date: true,
        description: true,
        category: true,
        roomNumber: true,
        customerName: true,
        // Explicitly exclude userId
      },
    });

    // Format data for Excel
    const excelData = transactions.map(transaction => ({
      ID: transaction.id,
      Type: transaction.type,
      Amount: transaction.amount,
      Date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      Description: transaction.description,
      Category: transaction.category || '',
      'Room Number': transaction.roomNumber || '',
      'Customer Name': transaction.customerName || '',
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="transactions-${format(new Date(), 'yyyy-MM-dd')}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export transactions' }, { status: 500 });
  }
}