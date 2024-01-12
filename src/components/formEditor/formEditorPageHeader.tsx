"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

import { useFormStore } from "@/lib/store/formStore";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import FormNameInput from "./formNameInput";
import NavLinks from "./navLinks";

export const FormEditorPageHeader = () => {
  const { form, isLoading } = useFormStore();

  if (isLoading || !form) {
    return <LoadingUI />;
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border/40 bg-white p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center max-lg:hidden">
        <Link href={"/dashboard"}>
          <Button variant="link" className="text-sm ">
            <Home className="mr-2 h-4 w-4 " /> Dashboard
          </Button>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/workspaces/${form.workspaceId}`}>
          <Button variant="link">{form.workspace.name}</Button>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <FormNameInput form={form} className="text-md font-medium" />
      </div>
      <div className="lg:hidden">
        <Link href={`/workspaces/${form.workspaceId}`}>
          <Button size="sm" variant="link" className="px-0 text-sm">
            <ChevronLeft className="mr-2 h-4 w-4 " />
            Back
          </Button>
        </Link>
      </div>
      <NavLinks form={form} />
      <div className="flex items-center gap-2">
        <UserButton />
      </div>
    </div>
  );
};

const LoadingUI = () => {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-white p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center ">
        <Skeleton className="mr-2 h-[40px] w-12" />
        <Skeleton className="mr-2 h-[40px] w-12" />
        <Skeleton className="mr-2 h-[40px] w-12" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="mr-2 h-[40px] w-12" />
        <Skeleton className="mr-2 h-[40px] w-12" />
      </div>
    </div>
  );
};
