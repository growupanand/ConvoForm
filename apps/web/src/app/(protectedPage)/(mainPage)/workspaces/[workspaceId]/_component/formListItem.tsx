"use client";

import Link from "next/link";
import { Form } from "@convoform/db";
import { Button } from "@convoform/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@convoform/ui/components/ui/dropdown-menu";
import { toast } from "@convoform/ui/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, MoreVertical, Trash } from "lucide-react";

import { ConfirmAction } from "@/components/common/confirmAction";
import { LinkN } from "@/components/common/linkN";
import { ListItem } from "@/components/common/listItem";
import { api } from "@/trpc/react";

type Props = {
  form: Form;
};

export function FormListItem({ form }: Readonly<Props>) {
  const queryClient = useQueryClient();
  const deleteForm = api.form.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Form deleted.",
        duration: 1500,
      });
      queryClient.invalidateQueries({
        queryKey: [["form", "getAll"]],
      });
      queryClient.invalidateQueries({
        queryKey: [["metrics"]],
      });
    },
    onError: () => {
      toast({
        title: "Unable to delete form",
        duration: 1500,
      });
    },
  });
  const isDeleting = deleteForm.isPending;

  const handleDeleteForm = () =>
    deleteForm.mutate({
      id: form.id,
    });

  return (
    <ListItem>
      <div className="flex items-center justify-between">
        <div className="grow">
          <LinkN href={`/forms/${form.id}`}>
            <Button
              variant="link"
              className="w-full justify-start ps-0 font-normal  hover:no-underline "
            >
              {form.name}
            </Button>
          </LinkN>
        </div>

        <div className="flex items-center gap-3">
          <div className="max-lg:hidden">
            {form.isPublished ? (
              <Link href={`/view/${form.id}`} target="_blank">
                <Button variant="link">
                  View form <ExternalLink className="ms-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="link" disabled>
                Not published
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger disabled={isDeleting}>
              <Button
                variant="link"
                size="icon"
                className="h-8 w-8 hover:no-underline"
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
              {form.isPublished ? (
                <Link href={`/view/${form.id}`} target="_blank">
                  <DropdownMenuItem className="cursor-pointer lg:hidden">
                    <ExternalLink className="mr-2 h-4 w-4" /> View form
                  </DropdownMenuItem>
                </Link>
              ) : (
                <DropdownMenuLabel className="text-muted-foreground font-normal lg:hidden">
                  Not published
                </DropdownMenuLabel>
              )}
              <ConfirmAction
                title="Are you sure you want to delete this form?"
                description="This action will delete all data related to this form. This action cannot be undone."
                onConfirm={handleDeleteForm}
                confirmText="Yes, delete form"
              >
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete form
                </DropdownMenuItem>
              </ConfirmAction>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </ListItem>
  );
}
