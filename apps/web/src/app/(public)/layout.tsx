import { PublicLayout } from "@/components/common/publicLayout/publicLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
