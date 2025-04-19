import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Fetch Google Forms from Drive API
    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.form'&fields=files(id,name,modifiedTime,webViewLink)",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to fetch Google Forms",
      );
    }

    const data = await response.json();
    return NextResponse.json({ forms: data.files || [] });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch Google Forms",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
