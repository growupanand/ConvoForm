import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import "nextra-theme-docs/style.css";

export const metadata = {
  title: "ConvoForm Docs",
  description: "Turn Forms into Conversations with AI",
};

const _banner = {
  key: "2.0-release",
  text: (
    <a href="https://nextra.site" target="_blank" rel="noreferrer">
      🎉 Nextra 4.0 is released. Read more →
    </a>
  ),
};

const navbar = (
  <Navbar
    logo={<span style={{ fontWeight: 800 }}>ConvoForm</span>}
    projectLink="https://github.com/growupanand/ConvoForm"
  />
);

const footer = <Footer>ConvoForm Documentation</Footer>;

import { getPageMap } from "nextra/page-map";

export default async function RootLayout({ children }) {
  const pageMap = await getPageMap();
  return (
    <html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/growupanand/ConvoForm/tree/main/apps/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
