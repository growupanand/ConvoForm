"use client";

import { usePathname } from "next/navigation";

import NavigationCardContent from "./navigationCardContent";

type Props = {
  orgId: string;
};

const NavigationDesktopCard = ({ orgId }: Props) => {
  const pathname = usePathname();

  return <NavigationCardContent pathname={pathname} orgId={orgId} />;
};

export default NavigationDesktopCard;
