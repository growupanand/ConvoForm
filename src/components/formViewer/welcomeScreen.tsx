import { Form } from "@prisma/client";
import React from "react";
import { Button } from "../ui/button";

type Props = {
  form: Form;
  onCTAClick: () => void;
};

export const WelcomeScreen = ({ form, onCTAClick: onClick }: Props) => {
  return (
    <div className="flex flex-col gap-5 items-center justify-center">
      <h1 className="text-7xl font-black">{form.welcomeScreenTitle}</h1>
      <p className="text-3xl font-medium">{form.welcomeScreenMessage}</p>
      <Button className="font-semibold rounded-xl text-2xl" onClick={onClick}>
        {form.welcomeScreenCTALabel}
      </Button>
    </div>
  );
};
