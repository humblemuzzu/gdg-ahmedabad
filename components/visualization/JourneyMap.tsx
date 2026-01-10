import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function JourneyMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Journey map</CardTitle>
        <CardDescription>Flow visualization placeholder (UI only)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-border bg-background/40 px-4 py-10 text-center">
          <p className="text-sm font-medium">Visualization slot</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a real graph (steps, branches, and office visits) after core data is connected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

