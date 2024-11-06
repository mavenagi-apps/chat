import { cn } from "./lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("bg-fg-primary/10 animate-pulse rounded-md", className)}
      {...props}
    />
  );
};

export const SkeletonDonutChart = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex w-full items-center justify-center p-6", className)}
      {...props}
    >
      <Skeleton className="aspect-square max-h-[250px] w-full max-w-[250px] rounded-full" />
    </div>
  );
};

export const SkeletonTable = ({
  className,
  rows = 5,
  cols = 3,
  showHeader = true,
  ...props
}: {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("w-full", className)} {...props}>
      <Table>
        {showHeader && (
          <TableHead>
            <TableRow>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableHeader key={i}>
                  <Skeleton className="h-4" />
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: cols }).map((_, i) => (
                <TableCell key={i}>
                  <Skeleton className="h-4" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
