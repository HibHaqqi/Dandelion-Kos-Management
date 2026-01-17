import { addCustomer } from '@/app/(dashboard)/customers/actions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string(),
  phone: z.string(),
  nik: z.string(),
  entryDate: z.string(),
  roomNumber: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = customerSchema.parse(json);
    await addCustomer(data);
    return NextResponse.json({ message: 'Customer added successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Failed to add customer:', error);
    return NextResponse.json({ message: 'Failed to add customer' }, { status: 500 });
  }
}
