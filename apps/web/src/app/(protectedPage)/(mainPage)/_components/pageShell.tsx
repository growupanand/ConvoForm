import { SidebarTrigger } from "@convoform/ui";

export function PageShell({
  children,
  title,
  actionButton,
  actionButtonBottom,
}: {
  children: React.ReactNode;
  title: string | React.ReactNode;
  actionButton?: React.ReactNode;
  actionButtonBottom?: React.ReactNode;
}) {
  return (
    <div className="pb-5 container px-4 ms-0 space-y-6">
      <div className=" space-y-4 ">
        <div className="flex items-baseline justify-between gap-3">
          <div className="grow flex items-center gap-2">
            <SidebarTrigger />
            {typeof title === "string" ? (
              <h1 className="py-2 font-semibold text-xl">{title}</h1>
            ) : (
              title
            )}
          </div>
          {actionButton}
        </div>
        {actionButtonBottom}
      </div>
      {children}
    </div>
  );
}
