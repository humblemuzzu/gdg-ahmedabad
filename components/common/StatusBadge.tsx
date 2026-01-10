import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: "pending" | "in_progress" | "done" | "blocked" }) {
  if (status === "done") return <Badge variant="success">Done</Badge>;
  if (status === "blocked") return <Badge variant="destructive">Blocked</Badge>;
  if (status === "in_progress") return <Badge>In progress</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}

