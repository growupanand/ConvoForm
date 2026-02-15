import { google } from "googleapis";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleSheetsProvider } from "./google-sheets";

// Mock googleapis
vi.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        generateAuthUrl: vi.fn().mockReturnValue("https://mock-auth-url.com"),
        getToken: vi.fn().mockResolvedValue({
          tokens: {
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
            expiry_date: 123456789,
          },
        }),
        setCredentials: vi.fn(),
        refreshAccessToken: vi.fn().mockResolvedValue({
          credentials: {
            access_token: "new-access-token",
            expiry_date: 987654321,
          },
        }),
      })),
    },
    sheets: vi.fn(),
  },
}));

describe("GoogleSheetsProvider", () => {
  let provider: GoogleSheetsProvider;
  const mockSheets = {
    spreadsheets: {
      values: {
        get: vi.fn(),
        update: vi.fn(),
        append: vi.fn(),
      },
    },
  };

  beforeEach(() => {
    provider = new GoogleSheetsProvider(
      "client-id",
      "client-secret",
      "redirect-uri",
    );
    (google.sheets as any).mockReturnValue(mockSheets);
    vi.clearAllMocks();
  });

  it("should generate auth url", () => {
    const url = provider.getAuthUrl();
    expect(url).toBe("https://mock-auth-url.com");
  });

  it("should exchange code for tokens", async () => {
    const tokens = await provider.callback("mock-code");
    expect(tokens).toEqual({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      expiresAt: new Date(123456789),
    });
  });

  it("should refresh tokens", async () => {
    const tokens = await provider.refreshToken("old-refresh-token");
    expect(tokens).toEqual({
      accessToken: "new-access-token",
      expiresAt: new Date(987654321),
    });
  });

  describe("onResponse", () => {
    const mockResponse = { name: "John", email: "john@example.com" };
    const mockConfig = { spreadsheetId: "sheet-123" };
    const mockTokens = { accessToken: "access", refreshToken: "refresh" };

    it("should append row with matching headers", async () => {
      // Mock existing headers
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [["name", "email"]] },
      });

      await provider.onResponse(mockResponse, mockConfig, mockTokens);

      // Verify fetching headers
      expect(mockSheets.spreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: "sheet-123",
        range: "A1:Z1",
      });

      // Verify update headers NOT called
      expect(mockSheets.spreadsheets.values.update).not.toHaveBeenCalled();

      // Verify append
      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: "sheet-123",
        range: "A1",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [["John", "john@example.com"]],
        },
      });
    });

    it("should add new headers and append row", async () => {
      // Mock existing headers
      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: { values: [["name"]] },
      });

      await provider.onResponse(mockResponse, mockConfig, mockTokens);

      // Verify update headers called
      expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith({
        spreadsheetId: "sheet-123",
        range: "A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["name", "email"]], // Order might depend on object keys iter order, but "email" should be appended
        },
      });

      // Verify append
      expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: {
            values: [["John", "john@example.com"]],
          },
        }),
      );
    });
  });
});
