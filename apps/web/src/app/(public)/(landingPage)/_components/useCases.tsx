import { SectionCard } from "@/components/sectionCard";
import { studyAbroadUseCasePath } from "@/lib/marketingPaths";
import Link from "next/link";

type UseCase = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const graduationCapIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="shrink-0 text-foreground"
  >
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </svg>
);

const useCases: UseCase[] = [
  {
    title: "Study-Abroad Consultancies",
    description:
      "Collect a full student profile - destination, course, intake, marks, budget, test status - before the first counselling call.",
    href: studyAbroadUseCasePath,
    icon: graduationCapIcon,
  },
];

export function UseCases() {
  return (
    <SectionCard>
      <h2
        id="use-cases-heading"
        className="mb-8 max-w-full break-words text-left text-2xl font-bold text-foreground lg:text-4xl"
      >
        Who is ConvoForm for?
      </h2>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {useCases.map((useCase) => (
          <li key={useCase.href} className="min-w-0">
            <Link
              href={useCase.href}
              className="block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="h-full rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-center space-x-3">
                  {useCase.icon}
                  <h3 className="min-w-0 break-words text-lg font-semibold text-card-foreground">
                    {useCase.title}
                  </h3>
                </div>
                <p className="break-words text-sm text-foreground">
                  {useCase.description}
                </p>
                <p className="mt-4 text-sm font-medium text-brand-600 dark:text-brand-400">
                  See the use case <span aria-hidden="true">→</span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
