import { PublicLayoutFooter } from "./publicLayoutFooter";
import { PublicLayoutHeader } from "./publicLayoutHeader";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site flex min-h-screen flex-col overflow-x-clip bg-marketing-paper font-body text-marketing-ink">
      <PublicLayoutHeader />
      <div className="flex-1">{children}</div>
      <PublicLayoutFooter />
    </div>
  );
}
