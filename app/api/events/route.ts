import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // sendBeacon() analytics handler — implementation дараа нэмнэ
  const body = await request.json();
  console.log("Event received:", body);
  return Response.json({ success: true });
}
