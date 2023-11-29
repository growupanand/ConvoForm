"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/fetch";
import { Form } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ExternalLink, Loader2, MoreVertical } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

type Props = {
  form: Form;
  onDeleted: (form: Form) => void;
  workspaceId: string;
};

type State = {
  isDeleting: boolean;
};

export function FormListItem({ form, onDeleted, workspaceId }: Props) {
  const [state, setState] = useState<State>({ isDeleting: false });
  const { isDeleting } = state;
  const createdAt = new Date(form.createdAt);
  const formatedCreatedAt = formatDate(createdAt.toDateString());

  const deleteForm = async () => {
    setState((cs) => ({ ...cs, isDeleting: true }));
    try {
      await apiClient(`workspaces/${workspaceId}/forms/${form.id}`, {
        method: "DELETE",
      });
      toast({
        action: (
          <div className="w-full">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-1">
                <Check className="text-white " />
              </div>
              <span>Form deleted</span>
            </div>
          </div>
        ),
        duration: 1500,
      });
      onDeleted(form);
    } catch (error) {
      toast({
        title: "Unable to delete form",
        duration: 1500,
        action: (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Retry"
            )}
          </Button>
        ),
      });
    } finally {
      setState((cs) => ({ ...cs, isDeleting: false }));
    }
  };

  return (
    <div className="p-3 flex justify-between items-center">
      <div className="grid gap-1">
        <Link href={`/forms/${form.id}`}>
          <span className="font-semibold">New form</span>
        </Link>
        <p className="text-muted-foreground text-xs">{formatedCreatedAt}</p>
      </div>
      <div className="flex items-center gap-3">
        <Link href={`/view/${form.id}`} target="_blank">
          <Button variant="link">
            View form <ExternalLink className="w-4 h-4 ms-2" />
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isDeleting}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={deleteForm}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
