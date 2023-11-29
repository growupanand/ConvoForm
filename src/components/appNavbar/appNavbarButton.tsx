import { AlignJustify } from "lucide-react";
import { SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";

export const AppNavbarButton = () => {
  return (
    <SheetTrigger asChild>
      <Button variant="outline">
        <AlignJustify />
      </Button>
    </SheetTrigger>
  );
};
