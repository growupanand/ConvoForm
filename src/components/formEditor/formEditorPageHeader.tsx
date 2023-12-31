"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import FormNameInput from "./formNameInput";
import NavLinks from "./navLinks";
import { useFormStore } from "@/lib/store/formStore";
import { Skeleton } from "../ui/skeleton";
import { UserButton } from "@clerk/nextjs";

export const FormEditorPageHeader = () => {
  const { form, isLoading } = useFormStore();

  if (isLoading || !form) {
    return <LoadingUI />;
  }

  return (
    <div className="flex justify-between items-center sticky top-0 p-3 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center max-lg:hidden">
        <Link href={"/dashboard"}>
          <Button variant="link" className="text-sm ">
            <Home className="w-4 h-4 mr-2 " /> Dashboard
          </Button>
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/workspaces/${form.workspaceId}`}>
          <Button variant="link">{form.workspace.name}</Button>
        </Link>
        <ChevronRight className="w-4 h-4" />
        <FormNameInput form={form} className="text-md font-semibold" />
      </div>
      <div className="lg:hidden">
        <Link href={`/workspaces/${form.workspaceId}`}>
          <Button size="sm" variant="link" className="text-sm px-0">
            <ChevronLeft className="w-4 h-4 mr-2 " />
            Back
          </Button>
        </Link>
      </div>
      <NavLinks form={form} />
      <div className="flex gap-2 items-center">
        <UserButton />
      </div>
    </div>
  );
};

const LoadingUI = () => {
  return (
    <div className="flex justify-between items-center sticky top-0 backdrop-blur-md shadow-sm p-3 z-10 border-b-2">
      <div className="flex items-center ">
        <Skeleton className="w-12 h-[40px] mr-2" />
        <Skeleton className="w-12 h-[40px] mr-2" />
        <Skeleton className="w-12 h-[40px] mr-2" />
      </div>
      <div className="flex gap-2 items-center">
        <Skeleton className="w-12 h-[40px] mr-2" />
        <Skeleton className="w-12 h-[40px] mr-2" />
      </div>
    </div>
  );
};
