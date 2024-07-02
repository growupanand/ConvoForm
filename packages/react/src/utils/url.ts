export const getAPIDomainUrl = (): string => {
  // If working on developing this package
  if (
    process.env.NEXT_PUBLIC_PACKAGE_ENV &&
    process.env.NEXT_PUBLIC_PACKAGE_ENV === "development"
  ) {
    return `http://localhost:3000`;
  }

  // Else if it is vercel deployment, return the preview url
  const vc = process.env.VERCEL_URL;
  if (vc) {
    return `https://${vc}`;
  }

  return "https://www.convoform.com";
};
