import BrandName from "@/components/brandName";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <main className="container max-w-[900px]">
      <nav className="flex justify-center items-center p-3 mt-5">
        <BrandName className="text-3xl" />
      </nav>
      {children}
    </main>
  );
}
