import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

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
          "w-full justify-start hover:no-underline text-base text-gray-500 hover:text-gray-900 font-normal hover:font-semibold py-0 ",
          isActive && "text-gray-900 font-semibold"
        )}
      >
        {name}
      </Button>
    </Link>
  );
};

export default AppNavBarLink;
