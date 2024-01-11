import { Badge } from "../ui/badge";
import { SectionCard } from "./sectionCard";

export function HowToUseSection() {
  return (
    <SectionCard title="How to use">
      <div className="space-y-6 ">
        <div className="flex items-start">
          <Badge variant="outline" className="text-lg font-extrabold">
            1
          </Badge>
          <div className="ml-3">
            <h3 className="text-black-500 text-xl font-bold">
              Craft Your Form
            </h3>
            <p className="text-md mt-2 max-w-screen-sm text-gray-500">
              {`Quickly design a personalized form by including desired fields such as 'Name', 'Email', or 'Phone Number'.`}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Badge variant="outline" className="text-lg font-extrabold ">
            2
          </Badge>
          <div className="ml-3">
            <h3 className="text-black-500 text-xl font-bold">
              Share with Ease
            </h3>
            <p className="text-md mt-2 max-w-screen-sm text-gray-500">
              Once your form is ready, share it effortlessly with peers,
              colleagues, or clients through email or social media.
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Badge variant="outline" className="text-lg font-extrabold">
            3
          </Badge>
          <div className="ml-3">
            <h3 className="text-black-500 text-xl font-bold">
              Check Out the Responses
            </h3>
            <p className="text-md mt-2 max-w-screen-sm text-gray-500">
              Stay in the loop with the responses. View neatly organized details
              and transcripts from conversations in a simple, structured table.{" "}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
