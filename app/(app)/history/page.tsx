import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">History</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your previous plans will appear here once persistence is implemented.
          </p>
        </div>
        <Badge variant="secondary">UI preview</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No saved plans</CardTitle>
          <CardDescription>When the backend is wired, this page becomes your working archive.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm text-muted-foreground">
            Tip: keep templates for common tasks like GST, FSSAI, and trade licenses.
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
            Create a new plan
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

