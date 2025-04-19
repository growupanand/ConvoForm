import { env } from "@/env";
import { type NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = env.GOOGLE_REDIRECT_URI;

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    return NextResponse.json(
      { error: "Google authentication is not properly configured." },
      { status: 500 },
    );
  }
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error || "Failed to exchange code for token");
    }

    // We'll send the token back to the parent window
    return new Response(
      `
      <html>
        <head>
          <script>
            window.opener.postMessage({ 
              type: 'GOOGLE_AUTH_SUCCESS', 
              token: '${tokenData.access_token}' 
            }, '*');
            window.close();
          </script>
        </head>
        <body>Authentication successful. You can close this window.</body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  } catch (error) {
    console.error("Google auth callback error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
