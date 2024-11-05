import { Button } from "@convoform/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@convoform/ui/components/ui/dialog";
import { Drawer, DrawerContent } from "@convoform/ui/components/ui/drawer";

import { useMediaQuery } from "@/hooks/use-media-query";

export function ResponsiveModal({
  children,
  title,
  open,
  setOpen,
}: Readonly<{
  children: React.ReactNode;
  title: string;
  open: boolean;
  setOpen?: (open: boolean) => void;
}>) {
  const [isDesktop] = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader className="mb-5">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} snapPoints={[0.95]}>
      <DrawerContent className="h-full">
        <div className="mb-3">
          <Button size="sm" variant="ghost" onClick={() => setOpen?.(false)}>
            Close
          </Button>
        </div>
        <div className="p-3">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
