import { env } from "@/env";
import { getFrontendBaseUrl } from "@/lib/url";
import { redirect } from "next/navigation";

// Replace with your actual credentials
const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI =
  env.GOOGLE_REDIRECT_URI ?? `${getFrontendBaseUrl()}/api/auth/google/callback`;

export async function GET() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    return new Response("Google authentication is not properly configured.", {
      status: 500,
    });
  }

  const scopes = ["https://www.googleapis.com/auth/drive.readonly"];

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.append("redirect_uri", GOOGLE_REDIRECT_URI);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", scopes.join(" "));
  authUrl.searchParams.append("access_type", "offline");
  authUrl.searchParams.append("prompt", "consent");

  // Redirect directly to the auth URL instead of returning JSON
  return redirect(authUrl.toString());
}
