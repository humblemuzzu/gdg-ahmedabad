import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProcessCost } from "@/types";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface ProcessCostBreakdownProps {
  costs?: ProcessCost[];
}

export function ProcessCostBreakdown({ costs = [] }: ProcessCostBreakdownProps) {
  const total = costs.reduce((sum, item) => sum + item.amountINR, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost breakdown</CardTitle>
        <CardDescription>Estimated fees and common expenses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {costs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">No cost estimate available</p>
            <p className="mt-1 text-xs text-muted-foreground">Submit a query to calculate costs</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-background/40 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Estimated total</p>
                <p className="text-sm font-semibold">{formatINR(total)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {costs.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background/30 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.note ? (
                      <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                    ) : null}
                  </div>
                  <p className="flex-shrink-0 text-sm font-semibold">{formatINR(item.amountINR)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

