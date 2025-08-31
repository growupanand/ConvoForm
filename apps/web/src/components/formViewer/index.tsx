"use client";

import { useCallback } from "react";

import { AskScreen } from "@/components/formViewer/askScreen";
import { EndScreen } from "@/components/formViewer/endScreen";
import { TopProgressBar } from "@/components/formViewer/topProgressBar";
import { WelcomeScreen } from "@/components/formViewer/welcomeScreen";
import { useFormContext } from "./formContext";

export function FormViewer() {
  const {
    currentSection,
    setCurrentSection,
    convoFormHook,
    currentFormDesign,
    endScreenMessage,
    progress: totalSubmissionProgress,
    form,
  } = useFormContext();

  const {
    submitAnswer,
    currentQuestionText,
    chatStatus,
    conversation,
    initializeConversation,
  } = convoFormHook;

  const isBusy = chatStatus === "streaming" || chatStatus === "submitted";
  const currentField = conversation?.formFieldResponses.find(
    (field) => field.id === conversation?.currentFieldId,
  );

  const shouldShowProgressBar = currentSection === "questions-screen";

  const handleCTAClick = useCallback(async () => {
    try {
      await initializeConversation();
    } catch (error) {
      console.log({ error });
    }
  }, []);

  const handlePostCTAClick = useCallback(
    () => setCurrentSection("questions-screen"),
    [],
  );

  const handleResetForm = useCallback(() => {
    convoFormHook.resetConversation();
    setCurrentSection("landing-screen");
  }, [convoFormHook, setCurrentSection]);

  return (
    <div className="relative w-full h-full  flex flex-col">
      {shouldShowProgressBar && (
        <TopProgressBar
          totalProgressPercentage={totalSubmissionProgress * 100}
          onReset={handleResetForm}
        />
      )}
      <div className="flex-1 relative">
        {((currentSection as string) === "" ||
          currentSection === "landing-screen" ||
          currentSection === "default-screen") && (
          <WelcomeScreen
            onCTAClick={handleCTAClick}
            postCTAClick={handlePostCTAClick}
            title={form.welcomeScreenTitle}
            message={form.welcomeScreenMessage}
            CTALabel={form.welcomeScreenCTALabel}
            fontColor={currentFormDesign.fontColor}
          />
        )}

        {currentSection === "questions-screen" && (
          <AskScreen
            currentQuestion={currentQuestionText}
            isFormBusy={isBusy}
            submitAnswer={submitAnswer}
            currentField={currentField}
            fontColor={currentFormDesign.fontColor}
          />
        )}
        {currentSection === "ending-screen" && (
          <EndScreen
            endScreenMessage={endScreenMessage}
            endScreenCTALabel={form.endScreenCTALabel || undefined}
            endScreenCTAUrl={form.endScreenCTAUrl || undefined}
            fontColor={currentFormDesign.fontColor}
          />
        )}
      </div>
    </div>
  );
}
