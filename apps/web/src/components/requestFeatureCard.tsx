import { Button } from "@convoform/ui/components/ui/button";

import Link from "next/link";

export function RequestFeatureCard() {
  return (
    <div className="flex items-center py-6">
      <Button asChild variant="default" size="lg">
        <Link
          target="_blank"
          href="https://convoform.canny.io/feature-requests"
        >
          Request new feature
        </Link>
      </Button>
    </div>
  );
}
