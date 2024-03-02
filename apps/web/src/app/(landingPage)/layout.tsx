import { Metadata } from "next";

import { Footer } from "@/app/(landingPage)/_components/footer";
import { Header } from "@/app/(landingPage)/_components/header";
import { SectionShell } from "./_components/sectionShell";

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
    images: [`/api/og`],
  },
};

export default function Layout({ children }: Props) {
  return (
    <main className="min-h-screen">
      <div className="item-center flex h-full flex-col justify-between">
        <div className="h-15 sticky top-0 z-50 w-full  border-b bg-white/80 shadow-sm backdrop-blur-lg">
          <div className="lg:container">
            <Header />
          </div>
        </div>
        <div>
          {children}
          <SectionShell>
            <Footer />
          </SectionShell>
        </div>
      </div>
    </main>
  );
}
