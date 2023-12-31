import { Footer } from "@/components/homepage/footer";
import { Header } from "@/components/homepage/header";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <main className="min-h-screen w-screen">
      <div className="flex flex-col h-full justify-between item-center">
        <div className="sticky top-0 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 w-full">
          <div className="lg:container">
            <Header />
          </div>
        </div>
        <div className="max-w-[900px] lg:container">
          {children}
          <Footer />
        </div>
      </div>
    </main>
  );
}
