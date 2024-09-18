"use client";

import { useFormEditor } from "../formEditorContext";
import { CustomizeEndingScreenCard } from "./customizeEndingScreen";
import { CustomizeLandingScreenCard } from "./customizeLandingScreen";
import { CustomizePageCard } from "./customizePage";
import { CustomizeQuestionsScreenCard } from "./customizeQuestionsScreen";

export function FormCustomizeSection() {
  const { currentSection } = useFormEditor();
  const renderSection = () => {
    switch (currentSection) {
      case "landing-screen":
        return <CustomizeLandingScreenCard />;
      case "questions-screen":
        return <CustomizeQuestionsScreenCard />;
      case "ending-screen":
        return <CustomizeEndingScreenCard />;
      case "customize-page":
        return <CustomizePageCard />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="font-medium text-lg mb-4">Design</div>
      {renderSection()}
    </div>
  );
}
