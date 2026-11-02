import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  // Public MDX pages (privacy, terms) provide their own layout and typography
  // through the shared legal page components, so do not wrap them in `prose`.
  return components;
}
