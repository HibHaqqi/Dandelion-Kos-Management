import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';
import * as XLSX from 'xlsx';
import { z } from 'zod';

// Custom date validation function
const validateDateFormat = (dateStr: string): boolean => {
  // Check if date matches yyyy-mm-dd format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }
  
  // Check if it's a valid date
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime()) && dateStr === date.toISOString().split('T')[0];
};

// Schema for validating imported transaction data
const importTransactionSchema = z.object({
  Type: z.enum(['revenue', 'expense'], {
    errorMap: () => ({ message: "Type must be either 'revenue' or 'expense'" })
  }),
  Amount: z.union([z.number(), z.string()], {
    errorMap: () => ({ message: "Amount must be a valid number" })
  }),
  Date: z.string().refine(validateDateFormat, {
    message: "Date must be in yyyy-mm-dd format (e.g., 2024-01-15)"
  }),
  Description: z.string().min(1, "Description cannot be empty"),
  Category: z.string().optional(),
  'Room Number': z.string().optional(),
  'Customer Name': z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const validTransactions = [];
    const errors = [];

    // Get existing rooms and customers for validation
    const existingRooms = await prisma.room.findMany({
      where: { userId: session.userId },
      select: { roomNumber: true }
    });
    const existingRoomNumbers = new Set(existingRooms.map(room => room.roomNumber));

    const existingCustomers = await prisma.customer.findMany({
      where: { userId: session.userId },
      select: { name: true }
    });
    const existingCustomerNames = new Set(existingCustomers.map(customer => customer.name));

    // Validate and process each row
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i] as any;
        const rowNumber = i + 2; // Excel row number (accounting for header)
        
        // Validate the row data with Zod schema
        const validatedData = importTransactionSchema.parse(row);
        
        // Convert amount to number if it's a string
        const amount = typeof validatedData.Amount === 'string'
          ? parseFloat(validatedData.Amount.toString().replace(/[^\d.-]/g, ''))
          : validatedData.Amount;

        if (isNaN(amount) || amount === 0) {
          errors.push(`Row ${rowNumber}: Amount must be a valid non-zero number (current value: "${validatedData.Amount}")`);
          continue;
        }

        // Validate room number exists if provided
        if (validatedData['Room Number'] && !existingRoomNumbers.has(validatedData['Room Number'])) {
          errors.push(`Row ${rowNumber}: Room number "${validatedData['Room Number']}" does not exist. Please create the room first or use an existing room number.`);
          continue;
        }

        // Validate customer name exists if provided
        if (validatedData['Customer Name'] && !existingCustomerNames.has(validatedData['Customer Name'])) {
          errors.push(`Row ${rowNumber}: Customer "${validatedData['Customer Name']}" does not exist. Please create the customer first or use an existing customer name.`);
          continue;
        }

        // Additional date validation
        const parsedDate = new Date(validatedData.Date);
        if (parsedDate > new Date()) {
          errors.push(`Row ${rowNumber}: Date cannot be in the future (${validatedData.Date})`);
          continue;
        }

        // Prepare transaction data with importer's userId
        const transactionData = {
          type: validatedData.Type,
          amount: amount,
          date: parsedDate,
          description: validatedData.Description,
          category: validatedData.Category || null,
          roomNumber: validatedData['Room Number'] || null,
          customerName: validatedData['Customer Name'] || null,
          userId: session.userId, // Use importer's user ID
        };

        validTransactions.push(transactionData);
      } catch (error) {
        const rowNumber = i + 2;
        if (error instanceof z.ZodError) {
          const detailedErrors = error.errors.map(e => {
            const field = e.path.join('.');
            return `${field}: ${e.message}`;
          });
          errors.push(`Row ${rowNumber}: ${detailedErrors.join(', ')}`);
        } else {
          errors.push(`Row ${rowNumber}: Invalid data format - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // If there are validation errors, return them with helpful information
    if (errors.length > 0) {
      return NextResponse.json({
        error: `Found ${errors.length} validation error${errors.length > 1 ? 's' : ''} in your import file`,
        details: errors,
        imported: 0,
        total: jsonData.length,
        suggestions: [
          "Ensure dates are in yyyy-mm-dd format (e.g., 2024-01-15)",
          "Verify room numbers exist in your system before importing",
          "Check that customer names match existing customers exactly",
          "Make sure amounts are valid numbers without currency symbols",
          "Type must be either 'revenue' or 'expense'"
        ]
      }, { status: 400 });
    }

    // Import valid transactions
    let importedCount = 0;
    const importErrors = [];

    for (const transaction of validTransactions) {
      try {
        await prisma.transaction.create({
          data: transaction,
        });
        importedCount++;
      } catch (error) {
        console.error('Database error during import:', error);
        importErrors.push(`Failed to import transaction "${transaction.description}": ${error instanceof Error ? error.message : 'Database error'}`);
      }
    }

    return NextResponse.json({
      message: 'Import completed',
      imported: importedCount,
      total: validTransactions.length,
      errors: importErrors.length > 0 ? importErrors : undefined,
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import transactions' }, { status: 500 });
  }
}