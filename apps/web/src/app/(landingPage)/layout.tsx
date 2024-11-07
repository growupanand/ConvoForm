import type { Metadata } from "next";

import { Footer } from "@/app/(landingPage)/_components/footer";
import { TopHeader } from "@/components/common/topHeader";

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
      <TopHeader className="lg:fixed max-lg:mb-10 top-0 z-50" />
      {children}
      <div className="lg:container">
        <Footer />
      </div>
    </main>
  );
}
