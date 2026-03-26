import { Badge } from "@/components/ui/badge";
import { statusLabels } from "@/types/domain";

const statusVariantMap: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
  IDLE: "outline",
  QUEUED: "warning",
  GENERATING: "warning",
  SUCCESS: "success",
  FAILED: "destructive",
  DRAFT: "outline",
  ANALYZED: "default",
  PLANNED: "warning",
  EDITING: "success",
  COMPLETED: "success",
};

const statusDotMap: Record<string, string> = {
  IDLE: "bg-slate-400",
  QUEUED: "bg-amber-500",
  GENERATING: "bg-amber-500",
  SUCCESS: "bg-emerald-500",
  FAILED: "bg-rose-500",
  DRAFT: "bg-slate-400",
  ANALYZED: "bg-sky-500",
  PLANNED: "bg-amber-500",
  EDITING: "bg-emerald-500",
  COMPLETED: "bg-emerald-500",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge
      variant={statusVariantMap[value] ?? "default"}
      className="max-w-full whitespace-nowrap text-xs leading-none"
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusDotMap[value] ?? "bg-slate-400"}`} />
      {statusLabels[value] ?? value}
    </Badge>
  );
}
