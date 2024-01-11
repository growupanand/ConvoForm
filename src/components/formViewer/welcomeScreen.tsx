import React from "react";
import { Form } from "@prisma/client";

import { Button } from "../ui/button";

type Props = {
  form: Form;
  onCTAClick: () => void;
};

export const WelcomeScreen = ({ form, onCTAClick: onClick }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h2 className="text-center text-5xl font-bold">
        {form.welcomeScreenTitle}
      </h2>
      <p className="mb-8 text-xl font-medium text-gray-800">
        {form.welcomeScreenMessage}
      </p>
      <div>
        <Button
          size="lg"
          className="rounded-full text-2xl font-semibold"
          onClick={onClick}
        >
          {form.welcomeScreenCTALabel}
        </Button>
      </div>
    </div>
  );
};
