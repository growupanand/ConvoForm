import { Badge } from "../ui/badge";
import { SectionCard } from "./sectionCard";

export function HowToUseSection() {
  return (
    <SectionCard title="How to use">
      <div className="space-y-6 ">
        <div className="flex items-start">
          <Badge variant="outline" className="font-extrabold text-lg">
            1
          </Badge>
          <div className="ml-3">
            <h3 className="font-bold text-black-500 text-xl">Create a form</h3>
            <p className="mt-2 max-w-screen-sm text-md text-gray-500">
              Create a form by telling form overview and form fields required.
              Example: Name and Email, Phone Number etc.
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Badge variant="outline" className="font-extrabold text-lg ">
            2
          </Badge>
          <div className="ml-3">
            <h3 className="font-bold text-black-500 text-xl">Share the form</h3>
            <p className="mt-2 max-w-screen-sm text-md text-gray-500">
              Share the form with your friends, colleagues and customers.
              Example: Share the form link via email, social media etc.
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Badge variant="outline" className="font-extrabold text-lg">
            3
          </Badge>
          <div className="ml-3">
            <h3 className="font-bold text-black-500 text-xl">See responses</h3>
            <p className="mt-2 max-w-screen-sm text-md text-gray-500">
              See there response data along with transcript of conversation.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
