import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const edges = [
  { from: "PAN", to: "GST", note: "Required for tax registration" },
  { from: "GST", to: "Shop & Establishment", note: "Often asked as proof of business" },
  { from: "Occupancy Certificate", to: "Fire NOC", note: "Mandatory for inspection" },
];

export function ProcessDependencyGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dependency graph</CardTitle>
        <CardDescription>Prerequisites at a glance (preview)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {edges.map((e) => (
          <div key={`${e.from}-${e.to}`} className="rounded-2xl border border-border bg-background/40 px-4 py-3">
            <p className="text-sm font-semibold">
              {e.from} <span className="text-muted-foreground">→</span> {e.to}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{e.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

