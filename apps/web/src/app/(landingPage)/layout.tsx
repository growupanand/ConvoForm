import type { Metadata } from "next";

import { Footer } from "@/app/(landingPage)/_components/footer";
import { Header } from "@/app/(landingPage)/_components/header";

/**
 * We need to force static rendering for our homepage, by setting `dynamic` to `force-static`
 * Because we used <ClerkProvider> in root Layout, Which make whole child tree to be dynamic rendered.
 */
export const dynamic = "force-static";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: {
    absolute: "ConvoForm | Create Conversational Forms",
  },
  openGraph: {
    title: {
      absolute: "ConvoForm | Create Conversational Forms",
    },
    images: ["/api/og"],
  },
};

export default function Layout({ children }: Readonly<Props>) {
  return (
    <main className="min-h-screen">
      <div className="item-center flex h-full flex-col justify-between">
        <div className="h-15 sticky top-0 z-50 w-full  border-b bg-white/80 shadow-sm backdrop-blur-2xl">
          <div className="lg:container">
            <Header />
          </div>
        </div>
        <div>
          {children}
          <div className="lg:container">
            <Footer />
          </div>
        </div>
      </div>
    </main>
  );
}
