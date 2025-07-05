"use client";

import type { Form } from "@convoform/db/src/schema";
import { Button } from "@convoform/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@convoform/ui";
import { toast } from "@convoform/ui";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookDashed,
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
  MoreVertical,
  Trash,
} from "lucide-react";
import Link from "next/link";

import { ConfirmAction } from "@/components/common/confirmAction";
import { LinkN } from "@/components/common/linkN";
import { ListItem } from "@/components/common/listItem";
import { copyLinkToClipboard, getFormSubmissionLink } from "@/lib/url";
import { api } from "@/trpc/react";

type Props = {
  form: Form;
  conversationsCount: number;
};

export function FormListItem({ form, conversationsCount }: Readonly<Props>) {
  const formSubmissionLink = getFormSubmissionLink(form.id);
  const handleCopyLinkToClipboard = () => {
    copyLinkToClipboard(formSubmissionLink);
    toast.success("Link copied to clipboard");
  };

  const queryClient = useQueryClient();
  const deleteForm = api.form.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted.", {
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
      toast.error("Unable to delete form", {
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
    <div className="group">
      <ListItem>
        <div className="flex items-center justify-between">
          <div className="grow">
            <LinkN href={`/forms/${form.id}`}>
              <Button
                variant="link"
                className="w-full justify-start ps-0 font-normal text-base  hover:no-underline "
              >
                <span className="form-name group-hover:translate-x-1 transition-all">
                  {form.name}
                </span>
              </Button>
            </LinkN>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-subtle-foreground">
              <MessageCircle className="size-4" />
              <span>{conversationsCount}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger disabled={isDeleting} asChild>
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
                  <>
                    <Link href={`/view/${form.id}`} target="_blank">
                      <DropdownMenuItem className="cursor-pointer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Open link
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuItem
                      onSelect={handleCopyLinkToClipboard}
                      className="cursor-pointer"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      <span>Copy link</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuLabel className="text-muted-foreground font-normal flex items-center">
                    <BookDashed className="mr-2 size-4" />
                    <span>Not published</span>
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
    </div>
  );
}
