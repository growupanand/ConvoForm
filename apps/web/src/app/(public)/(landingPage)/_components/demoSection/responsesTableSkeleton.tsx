import {
  ScrollArea,
  ScrollBar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@convoform/ui";

export function ResponsesTableSkeleton() {
  return (
    <ScrollArea className="h-full min-h-[300px] rounded-none">
      <Table>
        <TableHeader className="sticky top-0 z-30 bg-marketing-surface/95 backdrop-blur-sm">
          <TableRow>
            <TableHead className="w-[200px]">Submission</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Completion</TableHead>
            <TableHead className="text-right">Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <TableRow key={index} className="border-b">
              <TableCell>
                <div className="animate-pulse">
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="animate-pulse">
                  <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="animate-pulse">
                  <div className="h-4 w-12 bg-gray-200 rounded mx-auto" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 rounded ml-auto" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
