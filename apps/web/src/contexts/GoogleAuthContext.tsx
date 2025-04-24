"use client";
import { type ReactNode, createContext, useContext, useState } from "react";

interface GoogleAuthContextType {
  isAuthenticating: boolean;
  getAccessToken: () => Promise<string>;
  clearToken: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(
  undefined,
);

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);

  const isTokenValid = (accessToken: string | null): accessToken is string => {
    if (!accessToken || !tokenExpiry) return false;
    // Add 5 minute buffer before actual expiry
    return Date.now() < tokenExpiry - 5 * 60 * 1000;
  };

  const getAccessToken = async (): Promise<string> => {
    // Return existing token if still valid
    if (isTokenValid(accessToken)) {
      return accessToken;
    }

    setIsAuthenticating(true);

    try {
      // Open the auth window
      const authWindow = window.open(
        "/api/auth/google",
        "google-auth",
        "width=500,height=600",
      );

      if (!authWindow) {
        throw new Error(
          "Popup was blocked. Please enable popups for this site.",
        );
      }

      // Track if authentication was successful
      let authSuccessful = false;

      const token = await new Promise<string>((resolve, reject) => {
        // Set up polling to check if the window is closed
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            setIsAuthenticating(false);
            // If window closed without completing auth, reject the promise
            if (!authSuccessful) {
              reject(new Error("Authentication cancelled"));
            }
          }
        }, 500);

        // Listen for messages from the popup
        const messageHandler = (event: MessageEvent) => {
          // Add origin check for security
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
            authSuccessful = true;
            clearInterval(checkClosed);
            authWindow.close();
            window.removeEventListener("message", messageHandler);
            resolve(event.data.token);
          }
        };

        window.addEventListener("message", messageHandler);

        // Add a timeout in case the window is closed without completing auth
        setTimeout(() => {
          if (!authWindow.closed) {
            window.removeEventListener("message", messageHandler);
            reject(new Error("Authentication timed out"));
          }
        }, 120000); // 2 minute timeout
      });

      // Store token with expiry time (1 hour from now)
      setAccessToken(token);
      setTokenExpiry(Date.now() + 60 * 60 * 1000); // 1 hour in milliseconds
      return token;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const clearToken = () => {
    setAccessToken(null);
    setTokenExpiry(null);
  };

  return (
    <GoogleAuthContext.Provider
      value={{
        isAuthenticating,
        getAccessToken,
        clearToken,
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
}

// Custom hook to use the Google Auth context
export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error("useGoogleAuth must be used within a GoogleAuthProvider");
  }
  return context;
}
