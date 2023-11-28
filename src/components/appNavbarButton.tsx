import { AlignJustify } from "lucide-react";
import { Button } from "./ui/button";
import { SheetTrigger } from "./ui/sheet";

export const AppNavbarButton = () => {
  return (
    <SheetTrigger asChild>
      <Button variant="outline">
        <AlignJustify />
      </Button>
    </SheetTrigger>
  );
};
