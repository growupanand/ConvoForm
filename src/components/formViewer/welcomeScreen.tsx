import { Form } from "@prisma/client";
import React from "react";
import { Button } from "../ui/button";

type Props = {
  form: Form;
  onCTAClick: () => void;
};

export const WelcomeScreen = ({ form, onCTAClick: onClick }: Props) => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <h2 className="text-5xl font-bold text-center">
        {form.welcomeScreenTitle}
      </h2>
      <p className="text-xl font-medium text-gray-800 mb-8">
        {form.welcomeScreenMessage}
      </p>
      <div>
        <Button
          size="lg"
          className="font-semibold rounded-full text-2xl"
          onClick={onClick}
        >
          {form.welcomeScreenCTALabel}
        </Button>
      </div>
    </div>
  );
};
