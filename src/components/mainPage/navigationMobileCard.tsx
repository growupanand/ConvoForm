"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import BrandName from "../common/brandName";
import { Button } from "../ui/button";

type Props = {
  children: React.ReactNode;
};

type State = {
  open: boolean;
};

export function NavigationMobileCard({ children }: Props) {
  const [state, setState] = useState<State>({
    open: false,
  });
  const { open } = state;

  const closeSheet = () => setState((cs) => ({ ...cs, open: false }));

  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      closeSheet();
    }
  }, [pathname]);

  return (
    <Sheet
      open={open}
      onOpenChange={(status) => setState((cs) => ({ ...cs, open: status }))}
    >
      <div className="relative flex w-full items-center justify-between p-3">
        <BrandName />
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Menu />
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent side="left" className="w-[90%] ">
        <SheetClose />
        {children}
      </SheetContent>
    </Sheet>
  );
}

export default NavigationMobileCard;
