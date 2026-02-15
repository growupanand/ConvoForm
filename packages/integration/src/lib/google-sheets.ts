import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { type IntegrationConfig, IntegrationProvider } from "../provider";

export class GoogleSheetsProvider extends IntegrationProvider {
  name = "google_sheets";
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  private getOAuthClient(): OAuth2Client {
    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri,
    );
  }

  getAuthUrl(state?: string): string {
    const oauth2Client = this.getOAuthClient();
    const scopes = [
      "https://www.googleapis.com/auth/drive.file", // Access to files created or opened by the app
      "https://www.googleapis.com/auth/userinfo.email", // Get user email for info
    ];

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent", // Force consent to ensure we get a refresh token
      state,
    });
  }

  async callback(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    const oauth2Client = this.getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error("Failed to retrieve access token");
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || undefined,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresAt?: Date;
  }> {
    const oauth2Client = this.getOAuthClient();
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error("Failed to refresh access token");
    }

    return {
      accessToken: credentials.access_token,
      expiresAt: credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : undefined,
    };
  }

  async onResponse(
    response: Record<string, any>,
    config: IntegrationConfig,
    tokens: { accessToken: string; refreshToken?: string },
    context: { formId: string; formName: string },
  ): Promise<IntegrationConfig | undefined> {
    let { spreadsheetId } = config;

    const oauth2Client = this.getOAuthClient();
    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // Helper to create a new sheet if needed
    const createSheet = async () => {
      const drive = google.drive({ version: "v3", auth: oauth2Client });
      const file = await drive.files.create({
        requestBody: {
          name: `${context.formName}_${context.formId}`,
          mimeType: "application/vnd.google-apps.spreadsheet",
        },
        fields: "id",
      });
      return file.data.id;
    };

    // 1. Fetch existing headers or create new sheet if accessing fails
    let meta: any;
    try {
      if (!spreadsheetId) {
        throw new Error("No spreadsheet ID"); // Trigger creation
      }

      // If we have a temporary access token (from Picker), use it to "touch" the file first.
      // This grants access to the app if the Picker grant hasn't propagated yet.
      if (config.temporaryAccessToken) {
        console.log(
          "Using temporary access token to touch file:",
          spreadsheetId,
        );
        const tempClient = this.getOAuthClient();
        tempClient.setCredentials({
          access_token: config.temporaryAccessToken,
        });
        const tempSheets = google.sheets({ version: "v4", auth: tempClient });
        await tempSheets.spreadsheets.values.get({
          spreadsheetId,
          range: "A1:Z1",
        });
        console.log("Successfully touched file with temporary token.");
      }

      // Normal access check with stored credentials
      meta = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "A1:Z1",
      });
    } catch (error: any) {
      let userEmail = "unknown";
      try {
        const tokenInfo = await oauth2Client.getTokenInfo(tokens.accessToken);
        userEmail = tokenInfo.email || "unknown";
      } catch (e) {
        console.error("Failed to get token info", e);
      }

      console.log("Google Sheets Access Error:", {
        spreadsheetId,
        connectedEmail: userEmail,
        code: error.code,
        message: error.message,
        errors: error.errors,
      });

      // If 404 (Not Found) or 403 (Forbidden) or missing ID, create a new sheet
      if (
        !spreadsheetId ||
        error.code === 404 ||
        error.code === 403 ||
        error.message === "No spreadsheet ID"
      ) {
        spreadsheetId = await createSheet();
        if (!spreadsheetId) throw new Error("Failed to create spreadsheet");

        // TODO: We need to update the saved config with the new spreadsheetId so we don't create it every time.
        // This requires a callback or a way to return the new config.
        // For now, let's assume the caller can handle this or we just accept we might create duplicates if config isn't updated?
        // Actually, IntegrationProvider.onResponse returns Promise<void>.
        // We should probably change the signature to return the updated config, or we rely on the fact that for this specific turn, we just want it to work.
        // BUT, if we don't save it, the NEXT request will fail again and create ANOTHER sheet.
        // So we MUST return the new config.
        // Return new config
        if (spreadsheetId !== config.spreadsheetId) {
          // We will return the new config at the end, after appending data
          console.log("Created new spreadsheet:", spreadsheetId);
        }
      } else {
        throw error;
      }
    }

    // If we just created the sheet, meta is undefined. Initialize headers.
    let headers: string[] = meta?.data.values?.[0] || [];
    const responseKeys = Object.keys(response);

    // 2. Identify new headers
    const newHeaders = responseKeys.filter((key) => !headers.includes(key));

    if (newHeaders.length > 0) {
      // Append new headers
      headers = [...headers, ...newHeaders];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [headers],
        },
      });
    }

    // 3. Map response data to headers
    const row = headers.map((header) => {
      const value = response[header];
      if (value === undefined || value === null) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    });

    // 4. Append the row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "A1",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });

    // Return updated config if we created a new spreadsheet
    if (spreadsheetId !== config.spreadsheetId) {
      // Also remove temporary Access Token if exists
      // This is handled by the upstream logic but let's be safe
      const { temporaryAccessToken, ...cleanConfig } = config;
      // Wait, upstream already removes it if it was used.
      // Here `config` still has it if we didn't use it or if we are just updating ID.

      // If we created a new sheet, effectively `temporaryAccessToken` is irrelevant for it (since we own it).
      // So we should return clean config with new ID.
      return { ...cleanConfig, spreadsheetId: spreadsheetId };
    }
  }
}
