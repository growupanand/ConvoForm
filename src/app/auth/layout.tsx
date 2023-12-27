import BrandName from "@/components/brandName";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <main className="min-h-screen container">
      <nav className="flex justify-start items-center p-3 mb-10">
        <BrandName />
      </nav>
      {children}
    </main>
  );
}
