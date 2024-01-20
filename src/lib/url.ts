export const getBackendBaseUrl = () => {
  // If this is browser environment, return empty string
  // because we want to use relative path for browser
  if (typeof window !== "undefined") return "";

  // If this is vercel environment, return the preview url
  const vc = process.env.VERCEL_URL;
  if (vc) return `https://${vc}`;

  // If this is local environment, return localhost url
  return `http://localhost:3000`;
};

export const getFrontendBaseUrl = () => {
  // If this is vercel environment, return the preview url
  const vc = process.env.VERCEL_URL;
  if (vc) return `https://${vc}`;

  // If this is local environment, return localhost url
  return `http://localhost:3000`;
};
