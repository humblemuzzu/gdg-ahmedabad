import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sample = [
  {
    who: "Regulation Librarian",
    tone: "Research",
    text: "Trade license and FSSAI are baseline. Need to verify if fire NOC applies based on seating capacity and floor area.",
  },
  {
    who: "Risk Assessor",
    tone: "Risk",
    text: "Biggest blocker is zoning + occupancy certificate. If OC is missing, the whole plan slips.",
  },
  {
    who: "Dependency Builder",
    tone: "Strategy",
    text: "Parallelize: prepare documents + photos while GST is processing. Book inspection slot early.",
  },
];

export function AgentDebateViewer() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Agent debate</CardTitle>
            <CardDescription>Collaboration view placeholder (UI only)</CardDescription>
          </div>
          <Badge variant="secondary">Preview</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sample.map((m, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-background/40 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{m.who}</p>
              <Badge variant="outline">{m.tone}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{m.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

