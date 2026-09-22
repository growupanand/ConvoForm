import { Badge } from "@convoform/ui";
import { Card, CardContent } from "@convoform/ui";

const metrics = [
  { value: "--", label: "Counsellor hours saved every week" },
  { value: "--", label: "Unqualified calls avoided" },
  { value: "--", label: "Faster first response to hot leads" },
];

export function RoiSection() {
  return (
    <section className="py-14 lg:py-20">
      <div className="flex items-center justify-center gap-3">
        <h2 className="text-2xl lg:text-4xl font-bold text-center text-gray-800">
          What it is worth
        </h2>
        <Badge variant="outline" className="text-xs font-medium">
          Placeholder metrics
        </Badge>
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="rounded-3xl">
            <CardContent className="flex flex-col items-center gap-2 pt-8 pb-8 text-center">
              <span className="text-4xl font-bold text-brand-500">
                {metric.value}
              </span>
              <span className="text-sm text-subtle-foreground">
                {metric.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-subtle-foreground">
        Placeholders, not promises. Real numbers get published here from
        design-partner pilots.
      </p>
    </section>
  );
}
