import { NextResponse } from "next/server";
import { checkWorkingMailbox } from "@/lib/email-mailbox.server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; fullName?: string };
    const result = await checkWorkingMailbox(body.email ?? "", body.fullName);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true, email: result.email });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Unable to verify this email right now." },
      { status: 500 },
    );
  }
}
