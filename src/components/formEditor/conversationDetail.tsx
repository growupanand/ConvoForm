import { Conversation } from "@prisma/client";
import { FileText } from "lucide-react";

import { FormFieldData } from "@/lib/types/conversation";
import { Transcript } from "@/lib/types/transcript";
import TranscriptCard from "../transcriptCard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";

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
      <Card className="h-full border-none shadow-none">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className=" " />
                <h2 className="text-xl capitalize lg:text-2xl">
                  {conversation.name}
                </h2>
              </div>
              <span className="text-xs font-normal text-muted-foreground lg:text-sm">
                {conversation.createdAt.toLocaleString()}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-lg space-y-10">
            {!isFormDataEmpty && (
              <section className="">
                <h3 className="mb-3 text-lg font-semibold">Form Data</h3>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableBody>
                      {formFieldsDataKeys.map((key) => {
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
              </section>
            )}
            <section>
              <h3 className="mb-3 text-lg font-semibold">Transcript</h3>
              <TranscriptCard transcript={transcript} />
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const ConversationDetailSkeleton = () => {
  return (
    <div className="h-full lg:container">
      <Card className="h-full border-none shadow-none">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className=" " />
                <h2 className="text-2xl capitalize">
                  <Skeleton className="h-5 w-20" />
                </h2>
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                <Skeleton className="h-5 w-20" />
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-lg space-y-10">
            <section>
              <h3 className="mb-3 text-lg font-semibold">
                <Skeleton className="h-5 w-20" />
              </h3>
              <div className="overflow-hidden rounded-md border">
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
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

ConversationDetail.ConversationDetailSkeleton = ConversationDetailSkeleton;
