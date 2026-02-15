import { env } from "@/env";
import { getFrontendBaseUrl } from "@/lib/url";
import { appRouter, createCaller, createTRPCContext } from "@convoform/api";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  env.GOOGLE_REDIRECT_URI ?? `${getFrontendBaseUrl()}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    return NextResponse.json(
      { error: "Google authentication is not properly configured." },
      { status: 500 },
    );
  }
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  // Handle Integration Flow (Server-side)
  if (state?.startsWith("integration_")) {
    try {
      const providerWithId = state.replace("integration_", "");
      const ctx = await createTRPCContext({ req: request });
      const caller = createCaller(appRouter)(ctx);

      await caller.integration.callback({
        provider: providerWithId,
        code,
      });

      return redirect(
        `${getFrontendBaseUrl()}/settings/integrations?success=true`,
      );
    } catch (error) {
      console.error("Integration callback error:", error);
      return redirect(
        `${getFrontendBaseUrl()}/settings/integrations?error=Failed to connect`,
      );
    }
  }

  // Handle Form Import Flow (Client-side / Popup)
  // This defaults to correct behavior if state is 'import_mode' or missing (legacy)
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
      // If the token exchange fails, it might be due to checking the wrong flow or invalid code
      // But since we are here, we handle it as error
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
