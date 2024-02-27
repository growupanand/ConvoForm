import { Conversation } from "@convoform/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@convoform/ui/components/ui/card";
import { Skeleton } from "@convoform/ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@convoform/ui/components/ui/table";
import { FileText } from "lucide-react";

import { SectionCard } from "@/app/(landingPage)/_components/sectionCard";
import { FormFieldData } from "@/lib/types/conversation";
import { Transcript } from "@/lib/types/transcript";
import TranscriptCard from "./transcriptCard";

type Props = {
  conversation: Conversation;
};

export default function ConversationDetail({ conversation }: Props) {
  const formFieldsData = conversation.formFieldsData as FormFieldData;
  const formFieldsDataKeys = Object.keys(formFieldsData);
  const isFormDataEmpty = formFieldsDataKeys.length === 0;
  const transcript = conversation.transcript as Transcript;

  return (
    <div className="h-full lg:container">
      <div className="flex items-center justify-between px-3 pt-6">
        <div className="flex items-center gap-2">
          <FileText className=" " size={20} />
          <h2 className="text-xl font-medium capitalize lg:text-2xl">
            {conversation.name}
          </h2>
        </div>
        <span className="text-muted-foreground text-xs font-normal lg:text-sm">
          {conversation.createdAt.toLocaleString()}
        </span>
      </div>
      <div className="grid max-w-lg gap-3">
        {!isFormDataEmpty && (
          <SectionCard title="Collected data" titleClassName="font-medium">
            <div className="overflow-hidden rounded-md border bg-white">
              <Table className="">
                <TableBody>
                  {formFieldsDataKeys.map((key) => {
                    // Handled edge case where field value is not string but object
                    formFieldsDataKeys.forEach((key) => {
                      const formValue = formFieldsData[key];
                      if (!formValue) return;
                      const valueType = typeof formValue;
                      if (valueType !== "string") {
                        if (valueType === "object") {
                          formFieldsData[key] =
                            Object.values(formValue).join(", ");
                          return;
                        }
                        formFieldsData[key] = JSON.stringify(formValue);
                      }
                    });
                    return (
                      <TableRow key={formFieldsData[key]}>
                        <TableCell className="py-2">{key}</TableCell>
                        <TableCell className="py-2 font-medium">
                          {formFieldsData[key]}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        )}
        <SectionCard title="Transcript" titleClassName="font-medium">
          <TranscriptCard transcript={transcript} />
        </SectionCard>
      </div>
    </div>
  );
}

const ConversationDetailSkeleton = () => {
  return (
    <div className="h-full lg:container">
      <Card className="h-full border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className=" " />
                <h2 className="text-2xl capitalize">
                  <Skeleton className="h-5 w-20" />
                </h2>
              </div>
              <span className="text-muted-foreground text-sm font-normal">
                <Skeleton className="h-5 w-20" />
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-lg space-y-10">
            <div className="overflow-hidden rounded-md border bg-white">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="py-2">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="py-2 font-medium">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-2">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="py-2 font-medium">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

ConversationDetail.ConversationDetailSkeleton = ConversationDetailSkeleton;
