import { Conversation } from "@prisma/client";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
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
    <div className="container py-10 ">
      <div className="flex flex-col items-center">
        <div className="max-w-lg space-y-10">
          <div className="flex items-center gap-3">
            <FileText className="w-10 h-10 mr-3" />
            <h2 className="text-2xl">{conversation.name}</h2>
          </div>
          <section className="my-5">
            {!isFormDataEmpty && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Field name</TableHead>
                    <TableHead className="">Field value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formFieldsDataKeys.map((key) => {
                    return (
                      <TableRow key={formFieldsData[key]}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{formFieldsData[key]}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </section>
          <section className="my-5">
            <TranscriptCard transcript={transcript} />
          </section>
        </div>
      </div>
    </div>
  );
}
