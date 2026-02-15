export interface IntegrationConfig {
  [key: string]: any;
}

export abstract class IntegrationProvider {
  abstract name: string;

  /**
   * Returns the URL to redirect the user to for OAuth/Authorization.
   */
  abstract getAuthUrl(state?: string): string;

  /**
   * Exchanges the authorization code for access/refresh tokens.
   * Returns the tokens and any other necessary data to store.
   */
  abstract callback(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    [key: string]: any;
  }>;

  /**
   * Refreshes the access token using the refresh token.
   */
  abstract refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresAt?: Date;
  }>;

  /**
   * Handler called when a new form response is received.
   */
  abstract onResponse(
    response: any,
    config: IntegrationConfig,
    tokens: { accessToken: string; refreshToken?: string },
    context: { formId: string; formName: string },
  ): Promise<IntegrationConfig | undefined>;
}
