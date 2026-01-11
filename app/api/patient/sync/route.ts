import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { patientSchema } from "@/app/schemas/patientSchema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = patientSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }
    const patientData = result.data;
    await pusherServer.trigger("hospital-queue", "patient-update", patientData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pusher Trigger Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
