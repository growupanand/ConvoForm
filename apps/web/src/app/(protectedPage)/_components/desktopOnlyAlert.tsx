import BrandNameLink from "@/components/common/brandName";
import { Button } from "@convoform/ui";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function DesktopOnlyAlert() {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-gray-100">
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="relative z-10 max-w-md text-center">
          <AlertCircle
            className="mx-auto mb-6 h-24 w-24 text-blue-500"
            aria-hidden="true"
          />
          <h1 className="mb-4 text-3xl font-bold text-gray-800">
            Desktop Only Content
          </h1>
          <p className="mb-4 text-xl text-gray-600">
            We're sorry, but this content is only available on desktop devices.
          </p>
          <p className="mb-6 text-lg text-gray-600">
            Please visit this page on a larger screen to access the full
            experience.
          </p>
          <Button asChild className="mb-6">
            <Link href="/auth/register">Sign up free</Link>
          </Button>
          <div className="flex justify-center">
            <BrandNameLink />
          </div>
        </div>
      </div>
    </div>
  );
}
