import { DemoCtaButton } from "./demoCta";

export function FinalCtaSection() {
  return (
    <section className="py-14 lg:py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="max-w-2xl text-2xl lg:text-4xl font-bold text-gray-800">
          Stop spending counsellor time on{" "}
          <span className="text-brand-500">unqualified inquiries</span>
        </h2>
        <p className="max-w-xl text-subtle-foreground">
          See the qualification flow built around your own counselling process.
        </p>
        <DemoCtaButton />
      </div>
    </section>
  );
}
