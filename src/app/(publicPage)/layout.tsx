import { Metadata } from "next";

import { Footer } from "@/components/homepage/footer";
import { Header } from "@/components/homepage/header";

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: {
    absolute: "Experience The New Magic Of Rich Conversational Forms",
  },
  openGraph: {
    title: {
      absolute: "Experience The New Magic Of Rich Conversational Forms",
    },
  },
};

export default function Layout({ children }: Props) {
  return (
    <main className="min-h-screen w-screen">
      <div className="item-center flex h-full flex-col justify-between">
        <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-white backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="lg:container">
            <Header />
          </div>
        </div>
        <div className="lg:container lg:max-w-[900px]">
          {children}
          <Footer />
        </div>
      </div>
    </main>
  );
}
