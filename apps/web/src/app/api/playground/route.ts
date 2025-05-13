import { geolocation } from "@vercel/functions";
import { type NextRequest, userAgent } from "next/server";

export async function GET(request: NextRequest) {
  const meta = userAgent(request);
  const geoDetails = geolocation(request);
  const metaJson = { meta, geoDetails };
  console.log(metaJson);
  return Response.json(metaJson);
}
