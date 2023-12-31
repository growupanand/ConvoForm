import { Conversation } from "@prisma/client";
import { FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { FormFieldData } from "@/lib/types/conversation";
import { Transcript } from "@/lib/types/transcript";
import TranscriptCard from "../transcriptCard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

type Props = {
  conversation: Conversation;
};

export default function ConversationDetail({ conversation }: Props) {
  const formFieldsData = conversation.formFieldsData as FormFieldData;
  const formFieldsDataKeys = Object.keys(formFieldsData);
  const isFormDataEmpty = formFieldsDataKeys.length === 0;
  const transcript = conversation.transcript as Transcript;

  return (
    <div className="lg:container h-full">
      <Card className="h-full border-none shadow-none">
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className=" " />
                <h2 className="text-xl lg:text-2xl capitalize">
                  {conversation.name}
                </h2>
              </div>
              <span className="text-xs lg:text-sm text-muted-foreground font-normal">
                {conversation.createdAt.toLocaleString()}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-lg space-y-10">
            {!isFormDataEmpty && (
              <section className="">
                <h3 className="text-lg mb-3 font-semibold">Form Data</h3>
                <div className="rounded-md border overflow-hidden">
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
              <h3 className="text-lg mb-3 font-semibold">Transcript</h3>
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
    <div className="lg:container h-full">
      <Card className="h-full border-none shadow-none">
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className=" " />
                <h2 className="text-2xl capitalize">
                  <Skeleton className="w-20 h-5" />
                </h2>
              </div>
              <span className="text-sm text-muted-foreground font-normal">
                <Skeleton className="w-20 h-5" />
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-lg space-y-10">
            <section>
              <h3 className="text-lg mb-3 font-semibold">
                <Skeleton className="w-20 h-5" />
              </h3>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="py-2">
                        <Skeleton className="w-20 h-5" />
                      </TableCell>
                      <TableCell className="py-2 font-medium">
                        <Skeleton className="w-20 h-5" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2">
                        <Skeleton className="w-20 h-5" />
                      </TableCell>
                      <TableCell className="py-2 font-medium">
                        <Skeleton className="w-20 h-5" />
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
