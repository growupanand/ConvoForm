import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableRow, TableCell } from "./ui/table";

export const ConversationDetailLoading = () => {
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
