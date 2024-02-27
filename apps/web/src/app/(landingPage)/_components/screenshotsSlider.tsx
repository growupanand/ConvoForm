"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AspectRatio } from "@convoform/ui/components/ui/aspect-ratio";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@convoform/ui/components/ui/carousel";
import { useAnimate } from "framer-motion";

const screenshotsData = [
  {
    id: 1,
    alt: "screenshot of form editor",
    src: "/screenshots/formEditor.png",
    description: (
      <p>
        Easily customize form with{" "}
        <span className="font-medium">Live Preview</span>.
      </p>
    ),
  },
  {
    id: 2,
    alt: "screenshot of form response page",
    src: "/screenshots/responses.png",
    description: (
      <p>
        View <span className="font-medium">Collected data</span> and{" "}
        <span className="font-medium">Transcript</span> of conversation.
      </p>
    ),
  },
  {
    id: 3,
    alt: "screenshot of responses overview page",
    src: "/screenshots/responsesOverview.png",
    description: (
      <p>
        All responses <span className="font-medium">Table</span> in one place or{" "}
        <span className="font-medium">Export Data</span> in CSV format.
      </p>
    ),
  },
];

export function ScreenshotSlider() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const currentScreenshotData = screenshotsData[current];

  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", async () => {
      await animate(scope.current, { opacity: 0 }, { duration: 0.1 });
      setCurrent(api.selectedScrollSnap());
      await animate(scope.current, { opacity: 1 }, { duration: 0.5 });
    });
  }, [api]);

  return (
    <div>
      <Carousel setApi={setApi} className="w-full">
        <div className="overflow-hidden rounded-xl border shadow-lg">
          <CarouselContent>
            {screenshotsData.map((screenshot) => {
              return (
                <CarouselItem key={screenshot.id}>
                  <AspectRatio ratio={3 / 2}>
                    <Image alt={screenshot.alt} src={screenshot.src} fill />
                  </AspectRatio>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </div>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="mt-5 ">
        <div className="text-2xl font-light" ref={scope}>
          {currentScreenshotData?.description}
        </div>
      </div>
    </div>
  );
}
