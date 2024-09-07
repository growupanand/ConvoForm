export const getFrontendBaseUrl = () => {
  // If App url is defined (Production), return it
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return appUrl;
  }

  // Else if it is vercel deployment, return the preview url
  const vc = process.env.VERCEL_URL;
  if (vc) {
    return `https://${vc}`;
  }

  // else return localhost url
  return "http://localhost:3000";
};

export const getBackendBaseUrl = () => {
  // If this is browser environment, return empty string
  // because we want to use relative path for browser
  if (typeof window !== "undefined") return "";

  // else return frontend url as we are using nextjs api routes
  return getFrontendBaseUrl();
};

export const getTRPCUrl = () => {
  return `${getBackendBaseUrl()}/api/trpc`;
};
