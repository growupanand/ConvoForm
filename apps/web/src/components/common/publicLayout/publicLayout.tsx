import { PublicLayoutFooter } from "./publicLayoutFooter";
import { PublicLayoutHeader } from "./publicLayoutHeader";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="lg:fixed lg:top-0 lg:z-50 lg:mt-4 h-24 inset-x-0 lg:px-4">
        <PublicLayoutHeader />
      </div>
      <div className="lg:mt-24">{children}</div>
      <div className="lg:container">
        <PublicLayoutFooter className="max-lg:rounded-none" />
      </div>
    </div>
  );
}
