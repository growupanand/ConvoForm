import { Footer } from "@/components/homepage/footer";
import { Header } from "@/components/homepage/header";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <main className="h-screen w-screen  container  ">
      <div className="flex flex-col h-full justify-between ">
        <div className="flex flex-col items-center">
          <div className="sticky top-0 backdrop-blur-md bg-white/80 z-50 w-full flex justify-center ">
            <Header />
          </div>
          <div className="max-w-[900px]">
            {children}
            <Footer />
          </div>
        </div>
      </div>
    </main>
  );
}
