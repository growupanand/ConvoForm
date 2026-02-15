import { env } from "@/env";
import { redirect } from "next/navigation";

export async function GET() {
  const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = env.GOOGLE_REDIRECT_URI;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    return new Response("Google authentication is not properly configured.", {
      status: 500,
    });
  }

  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/forms.body.readonly",
  ];

  /* 
     We distinguish the "Form Import" flow from the "Integration" flow using the `state` parameter.
     - Form Import: state='import_mode' (Handled by client-side postMessage)
     - Integration: state='integration_...' (Handled by server-side DB storage)
    */
  const state = "import_mode";

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.append("redirect_uri", GOOGLE_REDIRECT_URI);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", scopes.join(" "));
  authUrl.searchParams.append("access_type", "offline");
  authUrl.searchParams.append("prompt", "consent");
  authUrl.searchParams.append("state", state);

  return redirect(authUrl.toString());
}
