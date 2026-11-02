import { TRPCReactProvider } from "@/trpc/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TRPCReactProvider>{children}</TRPCReactProvider>;
}
