import BrandName from "@/components/common/brandName";
import { AlertCircle } from "lucide-react";

export function DesktopOnlyAlert() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
      <div className="absolute inset-0 bg-white/70" aria-hidden="true" />
      <div className="relative z-10 text-center p-6 max-w-md">
        <AlertCircle
          className="h-24 w-24 mx-auto mb-6 text-blue-500"
          aria-hidden="true"
        />
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Desktop Only Content
        </h1>
        <p className="text-xl mb-4 text-gray-600">
          We're sorry, but this content is only available on desktop devices.
        </p>
        <p className="text-lg text-gray-600 mb-4">
          Please visit this page on a larger screen to access the full
          experience.
        </p>
        <div className="flex justify-center">
          <BrandName />
        </div>
      </div>
    </div>
  );
}
