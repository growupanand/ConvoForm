import { Card, CardContent, CardHeader } from "@convoform/ui";
import { Clock3, Flame, StickyNote } from "lucide-react";

const problems = [
  {
    icon: Clock3,
    title: "The same ten questions, all day",
    body: "Every WhatsApp inquiry and walk-in starts from zero: marks, country, budget, intake. Counsellors spend hours collecting basics.",
  },
  {
    icon: Flame,
    title: "Hot leads wait in the queue",
    body: "A student ready to apply gets the same response time as someone just browsing. By the time you reply, they have called another consultancy.",
  },
  {
    icon: StickyNote,
    title: "Follow-ups depend on memory",
    body: "Notes stay scattered across chats and registers. No score, no routing, no summary of who is worth a call back.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-14 lg:py-20">
      <h2 className="text-2xl lg:text-4xl font-bold text-center text-gray-800">
        Counsellors lose hours daily to{" "}
        <span className="text-brand-500">unqualified inquiries</span>
      </h2>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {problems.map((problem) => (
          <Card key={problem.title} className="rounded-3xl">
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-50">
                <problem.icon className="size-5 text-brand-500" />
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <h3 className="font-medium text-gray-800">{problem.title}</h3>
              <p className="text-sm text-subtle-foreground">{problem.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
