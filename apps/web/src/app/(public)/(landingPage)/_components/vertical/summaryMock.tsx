import { Badge } from "@convoform/ui";
import { Card, CardContent, CardHeader } from "@convoform/ui";
import { CheckCircle2, MessageCircle } from "lucide-react";

const capturedRows = [
  { label: "Destination", value: "UK, MSc Computer Science" },
  { label: "Academics", value: "72% in B.Tech, no backlogs" },
  { label: "Test scores", value: "IELTS 7.0" },
  { label: "Budget", value: "Rs 35-40 lakh" },
  { label: "Intake", value: "September 2026" },
  { label: "Visa history", value: "No refusals" },
];

// Placeholder visual standing in for a real product screenshot.
export function CounsellorSummaryMock() {
  return (
    <Card className="w-full max-w-md rounded-3xl border bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-500">
              <MessageCircle className="size-4 text-white" />
            </span>
            Counsellor summary
          </span>
          <Badge className="bg-brand-500 text-white">Hot lead</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {capturedRows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <span className="text-subtle-foreground">{row.label}</span>
            <span className="text-right font-medium text-gray-800">
              {row.value}
            </span>
          </div>
        ))}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
          <CheckCircle2 className="size-5 fill-brand-500 text-white" />
          Booking link sent to the student
        </div>
      </CardContent>
    </Card>
  );
}
