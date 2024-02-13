import { AuthProvider } from "@/components/providers/authProvider";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <AuthProvider>{children}</AuthProvider>;
}
