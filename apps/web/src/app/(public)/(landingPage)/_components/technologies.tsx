import { SectionCard } from "@/components/sectionCard";
import { Database, Server } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Technologies() {
  return (
    <SectionCard>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TechnologyCard
          icon={
            <Image
              src="/images/icons/docker-mark-blue.svg"
              alt="Docker"
              width={32}
              height={32}
            />
          }
          title="Docker"
          description="Quick setup with Docker Compose"
          url="https://github.com/growupanand/ConvoForm#docker-setup"
        />
        <TechnologyCard
          icon={<Server className="h-8 w-8 text-[#4A5568]" />}
          title="Self-Hosted"
          description="Deploy on your own infrastructure"
          url="https://github.com/growupanand/ConvoForm#local-setup"
        />
        <TechnologyCard
          icon={<Database className="h-8 w-8 text-[#3182CE]" />}
          title="Cloud Hosted"
          description="Use our hosted version"
          url="https://convoform.com/auth/register"
        />
      </div>
    </SectionCard>
  );
}

const TechnologyCard = ({
  icon,
  title,
  description,
  isNew = false,
  url,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isNew?: boolean;
  url: string;
}) => {
  return (
    <Link href={url} className="group">
      <div className="p-6 rounded-lg border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3 mb-3">
          {icon}
          <h3 className="font-semibold text-lg">{title}</h3>
          {isNew && (
            <span className="px-2 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
              New
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
};
