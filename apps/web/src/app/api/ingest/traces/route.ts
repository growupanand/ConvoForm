import { createTraceIngestHandler } from "@convoform/tracing";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const handler = createTraceIngestHandler({
  // biome-ignore lint/style/noNonNullAssertion: reason
  axiomToken: process.env.AXIOM_TOKEN!,
  axiomDataset: process.env.AXIOM_DATASET,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await handler(body);
  return NextResponse.json(result.data, { status: result.status });
}
