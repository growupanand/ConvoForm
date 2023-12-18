"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home } from "lucide-react";
import FormEditorCard from "@/components/formEditor/formEditorCard";
import { useFormEditorContext } from "@/app/(formEditorPage)/context";

export default function FormSideBar() {
  const { form } = useFormEditorContext();
  return (
    <>
      <div className="flex justify-start items-center sticky top-0 p-3 bg-gray-50/75 backdrop-blur-md">
        <Link href={"/dashboard"}>
          <Button variant="link">
            <Home className="w-4 h-4 mr-2" /> Dashboard
          </Button>
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/workspaces/${form.workspaceId}`}>
          <Button variant="link">Workspace</Button>
        </Link>
      </div>
      <FormEditorCard />
    </>
  );
}
