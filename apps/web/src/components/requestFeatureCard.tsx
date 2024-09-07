import { Button } from "@convoform/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@convoform/ui/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export function RequestFeatureCard() {
  return (
    <Card>
      <CardContent className="pt-6">
        <CardDescription className="text-lg">
          {`Feel like something's missing?, just post any feature request or
            idea here, and we will notify you once they are ready.`}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <div className="flex justify-end ">
          <Button asChild variant="secondary">
            <Link
              target="_blank"
              href="https://convoform.canny.io/feature-requests"
            >
              Request Feature
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
