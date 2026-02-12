"use client";

import { ConfirmAction } from "@/components/common/confirmAction";
import { Button } from "@convoform/ui";

type Props = {
  isFormBusy: boolean;
  onDelete: () => void;
};

export function FieldSheetActions({ isFormBusy, onDelete }: Props) {
  return (
    <div className="bg-background sticky bottom-0 mt-auto w-full py-5">
      <div className="grid gap-2">
        <Button type="submit" className="w-full" disabled={isFormBusy}>
          Save
        </Button>
        <ConfirmAction
          onConfirm={onDelete}
          title="Are you sure you want to delete this field?"
          description="This action cannot be undone."
          confirmText="Delete field"
        >
          <Button
            type="button"
            className=" w-full "
            disabled={isFormBusy}
            variant="ghost"
          >
            Delete field
          </Button>
        </ConfirmAction>
      </div>
    </div>
  );
}
