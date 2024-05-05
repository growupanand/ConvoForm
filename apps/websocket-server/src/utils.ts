/**
 *  Extracts the domain from a URL
 * Example:
 * https://staging.convoform.com => convoform.com
 * https://convoform.com => convoform.com
 * http://localhost:3000 => localhost
 * @param url
 * @returns
 */
export const extractDomainFromUrl = (url: string) => {
  const domain = new URL(url).hostname;
  if (domain.includes("localhost")) {
    return "localhost";
  }
  const parts = domain.split(".");
  const tld = parts[parts.length - 1];
  const domainName = parts[parts.length - 2];
  return `${domainName}.${tld}`;
};
