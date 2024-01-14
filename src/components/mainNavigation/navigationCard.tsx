import NavigationDesktopCard from "./navigationDesktopCard";
import NavigationMobileCard from "./navigationMobileCard";

type Props = {
  orgId: string;
};

export async function NavigationCard({ orgId }: Props) {
  return (
    <>
      {/* Mobile view */}
      <div className="lg:hidden">
        <NavigationMobileCard orgId={orgId} />
      </div>

      {/* Desktop View */}
      <div className="min-w-[300px] max-lg:hidden">
        <NavigationDesktopCard orgId={orgId} />
      </div>
    </>
  );
}

export default NavigationCard;
