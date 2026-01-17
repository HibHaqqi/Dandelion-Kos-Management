import { addTransaction } from '@/app/(dashboard)/transactions/actions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const transactionSchema = z.object({
  type: z.enum(['revenue', 'expense']),
  amount: z.number(),
  date: z.string(),
  description: z.string(),
  category: z.string().optional(),
  roomNumber: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = transactionSchema.parse(json);
    await addTransaction(data);
    return NextResponse.json({ message: 'Transaction added successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Failed to add transaction:', error);
    return NextResponse.json({ message: 'Failed to add transaction' }, { status: 500 });
  }
}
