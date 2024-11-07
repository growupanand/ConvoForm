import BrowserWindow from "@/components/common/browserWindow";
import { FormViewer } from "@/components/formViewer";
import { getFrontendBaseUrl } from "@/lib/url";
import { DEMO_FORM_ID } from "../constants";

const demoFormLink = `${getFrontendBaseUrl()}/view/${DEMO_FORM_ID}`;

export const DemoFormCard = () => {
  return (
    <div>
      <BrowserWindow className="shadow-none" link={demoFormLink} hideCopyButton>
        <div className="w-[800px] h-[600px] flex flex-col items-center justify-center">
          <FormViewer />
        </div>
      </BrowserWindow>
    </div>
  );
};
