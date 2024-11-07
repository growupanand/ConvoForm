import { CollectedDataTable } from "@/app/(protectedPage)/forms/[formId]/conversations/_components/collectedDataTable";
import { useFormContext } from "@/components/formViewer/formContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@convoform/ui/components/ui/card";

export function DemoCollectedDataTable() {
  const {
    convoFormHook: { collectedData = [], isConversationStarted },
  } = useFormContext();

  const showTable = isConversationStarted && collectedData.length > 0;

  return (
    <div>
      <Card className="w-[300px] min-h-[250px] bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-center">Feedback response</CardTitle>
        </CardHeader>
        <CardContent>
          {!showTable && (
            <p className="text-muted-foreground text-lg text-center">
              Try filling form to see live collected data here
            </p>
          )}
          {showTable && <CollectedDataTable collectedData={collectedData} />}
        </CardContent>
      </Card>
    </div>
  );
}
