import type { Form, FormDesignRenderSchema } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui/components/ui/button";

import { montserrat, roboto } from "@/app/fonts";
import { cn } from "@/lib/utils";

type Props = {
  form: Form;
  onCTAClick: () => void;
  formDesign: FormDesignRenderSchema;
};

export const WelcomeScreen = ({
  form,
  onCTAClick: onClick,
  formDesign,
}: Props) => {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <h2
        style={{ color: formDesign.fontColor }}
        className={cn(
          " whitespace-break-spaces break-all text-center text-2xl font-semibold lg:text-4xl transition-colors duration-500",
          roboto.className,
        )}
      >
        {form.welcomeScreenTitle}
      </h2>
      <p
        style={{ color: formDesign.fontColor }}
        className="mb-8 whitespace-break-spaces break-all text-justify text-xl lg:text-2xl transition-colors duration-500"
      >
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
