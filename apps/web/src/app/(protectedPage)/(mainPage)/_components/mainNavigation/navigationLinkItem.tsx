import { Button } from "@convoform/ui/components/ui/button";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import Link from "next/link";

import type { NavLink } from "@/lib/types/navigation";
import { cn } from "@/lib/utils";

const NavigationLinkItem = ({
  isActive,
  link,
  name,
  activeClassName,
}: NavLink) => {
  return (
    <Link href={link}>
      <Button
        variant="link"
        className={cn(
          "w-full justify-start py-1 h-auto px-0 text-sm  font-normal text-gray-500 hover:font-medium hover:text-gray-900 hover:no-underline ",
          isActive && "font-medium text-gray-900",
        )}
      >
        <span className={activeClassName}>{name}</span>
      </Button>
    </Link>
  );
};

const NavigationLinkItemSkeleton = () => {
  return (
    <Button variant="link" className="w-full justify-start py-0">
      <Skeleton className="h-2 w-20" />
    </Button>
  );
};

NavigationLinkItem.Skeleton = NavigationLinkItemSkeleton;

export default NavigationLinkItem;
