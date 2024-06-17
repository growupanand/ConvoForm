import React from "react";
import { Form } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";

import { montserrat, roboto } from "@/app/fonts";
import { cn } from "@/lib/utils";

type Props = {
  form: Form;
  onCTAClick: () => void;
};

export const WelcomeScreen = ({ form, onCTAClick: onClick }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <h2
        className={cn(
          " whitespace-break-spaces break-all text-center text-2xl font-semibold lg:text-4xl",
          roboto.className,
        )}
      >
        {form.welcomeScreenTitle}
      </h2>
      <p className="mb-8 whitespace-break-spaces break-all text-justify text-xl lg:text-2xl">
        {form.welcomeScreenMessage}
      </p>
      <div>
        <Button
          size="lg"
          className={cn(
            "whitespace-break-spaces rounded-lg text-xl font-semibold uppercase transition-all hover:scale-110 active:scale-100 lg:text-2xl",
            montserrat.className,
          )}
          onClick={onClick}
        >
          {form.welcomeScreenCTALabel}
        </Button>
      </div>
    </div>
  );
};
