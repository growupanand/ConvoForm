export const getAPIDomainUrl = (): string => {
  // If working on developing this package
  if (
    process.env.NEXT_PUBLIC_PACKAGE_ENV &&
    process.env.NEXT_PUBLIC_PACKAGE_ENV === "development"
  ) {
    return "http://localhost:3000";
  }
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

  return "https://www.convoform.com";
};
