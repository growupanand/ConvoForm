import { Card, CardContent } from "@convoform/ui";
import {
  BookOpenCheck,
  CalendarClock,
  FileWarning,
  Globe2,
  GraduationCap,
  ListChecks,
  Plane,
  Wallet,
} from "lucide-react";

const capturedFields = [
  { icon: BookOpenCheck, label: "Marks and academics" },
  { icon: Globe2, label: "Destination" },
  { icon: GraduationCap, label: "Course" },
  { icon: CalendarClock, label: "Intake" },
  { icon: Wallet, label: "Budget" },
  { icon: ListChecks, label: "IELTS / TOEFL / GRE" },
  { icon: FileWarning, label: "Backlogs" },
  { icon: Plane, label: "Visa history" },
];

export function CaptureGridSection() {
  return (
    <section className="py-14 lg:py-20">
      <h2 className="text-2xl lg:text-4xl font-bold text-center text-gray-800">
        What it captures
      </h2>
      <p className="mt-3 text-center text-subtle-foreground">
        Everything your counsellor asks on a first call, collected before the
        call.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {capturedFields.map((field) => (
          <Card key={field.label} className="rounded-3xl">
            <CardContent className="flex flex-col items-center gap-3 pt-6 pb-6 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-50">
                <field.icon className="size-5 text-brand-500" />
              </span>
              <span className="text-sm font-medium text-gray-800">
                {field.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
