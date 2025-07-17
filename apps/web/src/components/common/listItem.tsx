import { cn } from "@/lib/utils";

export function ListItem({
  children,
  active = false,
}: Readonly<{ children: React.ReactNode; active?: boolean }>) {
  return (
    <div
      className={cn(
        "py-1 px-2 align-middle transition-all hover:bg-gray-50",
        active ? "bg-blue-50 border-l-2 border-blue-500" : "",
      )}
    >
      {children}
    </div>
  );
}
