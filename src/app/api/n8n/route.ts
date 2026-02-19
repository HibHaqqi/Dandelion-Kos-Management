import { addTransaction } from "@/app/(dashboard)/transactions/actions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Assuming the body has the same structure as addTransaction expects
    await addTransaction(body);

    return NextResponse.json(
      { message: "Webhook received and transaction added" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}
