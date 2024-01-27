import React from "react";
import { Form } from "@convoform/db";
import { Button } from "@convoform/ui/components/ui/button";

import { montserrat, roboto } from "@/app/fonts";
import { cn } from "@/lib/utils";

type Props = {
  form: Form;
  onCTAClick: () => void;
};

export const WelcomeScreen = ({ form, onCTAClick: onClick }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h2 className={cn("text-center text-5xl font-bold", roboto.className)}>
        {form.welcomeScreenTitle}
      </h2>
      <p className="mb-8 text-2xl font-light ">{form.welcomeScreenMessage}</p>
      <div>
        <Button
          size="lg"
          className={cn(
            "rounded-full text-2xl font-semibold uppercase transition-all hover:scale-110 active:scale-100",
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
