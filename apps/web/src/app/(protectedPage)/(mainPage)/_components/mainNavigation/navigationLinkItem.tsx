import { Button } from "@convoform/ui/components/ui/button";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  isActive?: boolean;
  href: string;
  name: string;
};

const NavigationLinkItem = ({ isActive, href, name }: Props) => {
  return (
    <Link href={href}>
      <Button
        variant="link"
        className={cn(
          "w-full justify-start py-0 text-base font-normal text-gray-500 hover:font-medium hover:text-gray-900 hover:no-underline ",
          isActive && "font-medium text-gray-900",
        )}
      >
        {name}
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
