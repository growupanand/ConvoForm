import { Card, CardContent } from "@convoform/ui";
import { MessagesSquare, Smartphone, Sparkles } from "lucide-react";

const steps = [
  {
    icon: MessagesSquare,
    step: "Step 1",
    title: "Student chats",
    body: "Share one link on WhatsApp, Instagram or your website. The AI interviews the student like your best counsellor would.",
  },
  {
    icon: Sparkles,
    step: "Step 2",
    title: "AI extracts and scores",
    body: "Answers become structured data plus a hot, warm or not-ready score, based on qualification rules you set.",
  },
  {
    icon: Smartphone,
    step: "Step 3",
    title: "Counsellor gets the summary",
    body: "A WhatsApp summary with everything the student shared, and a booking link goes to qualified students automatically.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-14 lg:py-20">
      <h2 className="text-2xl lg:text-4xl font-bold text-center text-gray-800">
        How it works
      </h2>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title} className="rounded-3xl">
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-50">
                  <step.icon className="size-5 text-brand-500" />
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">
                  {step.step}
                </span>
              </div>
              <h3 className="font-medium text-gray-800">{step.title}</h3>
              <p className="text-sm text-subtle-foreground">{step.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
