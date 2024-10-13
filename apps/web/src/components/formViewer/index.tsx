"use client";

import type { ExtraStreamData, Form } from "@convoform/db/src/schema";
import { useConvoForm } from "@convoform/react";
import { useEffect } from "react";

import type { FormSections } from "@convoform/db/src/schema/formDesigns/constants";
import { AskScreen } from "./askScreen";
import { EndScreen } from "./endScreen";
import { useFormDesign } from "./formDesignContext";
import { TopProgressBar } from "./topProgressBar";
import { WelcomeScreen } from "./welcomeScreen";

type Props = {
  form: Form;
  isPreview?: boolean;
};

export function FormViewer({ form, isPreview }: Readonly<Props>) {
  const { currentSection, setCurrentSection, activeFormDesign } =
    useFormDesign();

  const {
    submitAnswer,
    currentQuestion,
    isBusy,
    isFormSubmissionFinished,
    endScreenMessage: generatedEndScreenMessage,
    resetForm,
    currentField,
    collectedData,
    isConversationStarted,
    startConversation,
  } = useConvoForm({
    formId: form.id,
  });

  const customEndScreenMessage = form.customEndScreenMessage || undefined;
  const endScreenMessage = form.showCustomEndScreenMessage
    ? customEndScreenMessage
    : generatedEndScreenMessage;

  const totalSubmissionProgress = getSubmissionProgress(collectedData);
  const shouldShowProgressBar =
    !isPreview &&
    (currentSection === "questions-screen" ||
      currentSection === "ending-screen");

  const gotoStage = (section: FormSections) => {
    setCurrentSection(section);
  };

  const handleCTAClick = async () => {
    await startConversation();
    gotoStage("questions-screen");
  };

  useEffect(() => {
    if (
      currentSection === "questions-screen" &&
      (!isConversationStarted || isFormSubmissionFinished)
    ) {
      startConversation();
    }
  }, [currentSection, form]);

  useEffect(() => {
    if (currentSection !== "questions-screen") {
      resetForm();
    }
  }, [form]);

  useEffect(() => {
    if (isFormSubmissionFinished) {
      gotoStage("ending-screen");
    }
  }, [isFormSubmissionFinished]);

  return (
    <div className="container max-w-[800px]">
      {shouldShowProgressBar && (
        <TopProgressBar totalProgress={totalSubmissionProgress} />
      )}
      {((currentSection as string) === "" ||
        currentSection === "landing-screen" ||
        currentSection === "default-screen") && (
        <WelcomeScreen
          form={form}
          onCTAClick={handleCTAClick}
          formDesign={activeFormDesign}
          gotoStage={gotoStage}
        />
      )}

      {currentSection === "questions-screen" && (
        <AskScreen
          currentQuestion={currentQuestion}
          isFormBusy={isBusy}
          submitAnswer={submitAnswer}
          currentField={currentField}
          formDesign={activeFormDesign}
        />
      )}
      {currentSection === "ending-screen" && (
        <EndScreen
          endScreenMessage={endScreenMessage}
          endScreenCTALabel={form.endScreenCTALabel || undefined}
          endScreenCTAUrl={form.endScreenCTAUrl || undefined}
          formDesign={activeFormDesign}
        />
      )}
    </div>
  );
}

function getSubmissionProgress(
  collectedData: ExtraStreamData["collectedData"],
) {
  const totalFieldsRequired = collectedData?.length ?? 0;
  const totalFieldsCollected =
    collectedData?.filter(({ fieldValue }) => Boolean(fieldValue)).length ?? 0;
  const totalProgress = (totalFieldsCollected / totalFieldsRequired) * 100;
  return totalProgress;
}
