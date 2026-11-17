import { NextResponse } from "next/server";
import { requireTeamAdmin } from "@/lib/staff-access";
import { isStaffRole } from "@/lib/staff-roles";
import { decideStaffChange, requestStaffChange, StaffRequestError } from "@/lib/staff-access-requests";

function parseCommand(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const fields = body as Record<string, unknown>;
  const reason = typeof fields.reason === "string" ? fields.reason.trim() : "";
  if (reason.length < 10 || reason.length > 500) return null;

  if (fields.type === "request" && (fields.change === "grant" || fields.change === "revoke")) {
    const email = typeof fields.email === "string" ? fields.email.trim() : "";
    const role = fields.role === undefined ? "AUDITOR" : fields.role;
    if (isStaffRole(role) && email.length <= 254 && /^[^\s@]+@[^\s@]+$/.test(email)) {
      return { type: fields.type, change: fields.change, email, reason, role } as const;
    }
  }
  if (fields.type === "decision" && (fields.decision === "approve" || fields.decision === "reject")) {
    const id = typeof fields.id === "string" ? fields.id : "";
    if (/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)) {
      return { type: fields.type, decision: fields.decision, id, reason } as const;
    }
  }
  return null;
}

export async function POST(req: Request) {
  const auth = await requireTeamAdmin();
  if (auth instanceof NextResponse) return auth;
  const data = parseCommand(await req.json().catch(() => null));
  if (!data) {
    return NextResponse.json({ error: "Check the action, email and reason (10–500 characters)." }, { status: 400 });
  }
  try {
    if (data.type === "request") {
      await requestStaffChange(auth.user, data.email, data.change, data.reason, data.role);
    } else {
      await decideStaffChange(auth.user, data.id, data.decision, data.reason);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof StaffRequestError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
    if (code === "P2034" || code === "P2002") {
      return NextResponse.json({ error: "Access changed concurrently. Refresh and try again." }, { status: 409 });
    }
    console.error("Staff access update failed", code);
    return NextResponse.json({ error: "Unable to update staff access." }, { status: 500 });
  }
}
