import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type Props = {
  isActive?: boolean;
  href: string;
  name: string;
};

const AppNavBarLink = ({ isActive, href, name }: Props) => {
  return (
    <Link href={href}>
      <Button
        variant="link"
        className={cn(
          "w-full justify-start py-0 text-base font-normal text-gray-500 hover:font-semibold hover:text-gray-900 hover:no-underline ",
          isActive && "font-semibold text-gray-900",
        )}
      >
        {name}
      </Button>
    </Link>
  );
};

export default AppNavBarLink;
