export const getAPIDomainUrl = (): string => {
  // If it is vercel deployment
  if (process.env.VERCEL_URL && process.env.VERCEL_URL !== "") {
    return `https://${process.env.VERCEL_URL}`;
  }

  // If production domain is set in the environment
  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    process.env.NEXT_PUBLIC_APP_URL !== ""
  ) {
    return `https://${process.env.NEXT_PUBLIC_APP_URL}`;
  }

  return "http://localhost:3000";
};
