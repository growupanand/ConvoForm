import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@convoform/ui";

const faqs = [
  {
    question: "How does the student talk to it?",
    answer:
      "You share one link on WhatsApp, Instagram or your website. The student opens it and has a chat-style conversation on any phone. No app to install, no account to create.",
  },
  {
    question: "What exactly does the counsellor receive?",
    answer:
      "A WhatsApp summary for every inquiry: the lead score, everything the student shared (marks, destination, course, intake, budget, test scores, backlogs, visa history) and the suggested next step.",
  },
  {
    question: "Does it replace our counsellors?",
    answer:
      "No. It handles first-pass qualification so your counsellors spend their time on students who are actually ready, with full context before the first call.",
  },
  {
    question: "Can it match our counselling process?",
    answer:
      "Yes. The questions, branching and scoring rules are configured around your destinations, courses and intakes, so the conversation follows your flow, not a generic script.",
  },
  {
    question: "How do we become a design partner?",
    answer:
      "Book a demo and we will walk you through a qualification flow built around your own counselling process. If it fits, we set you up as one of the three design-partner consultancies.",
  },
];

export function FaqSection() {
  return (
    <section className="py-14 lg:py-20">
      <h2 className="text-2xl lg:text-4xl font-bold text-center text-gray-800">
        Questions consultancies ask
      </h2>
      <div className="mx-auto mt-10 max-w-2xl">
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-subtle-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
