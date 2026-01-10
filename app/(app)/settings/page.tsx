import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">Workspace preferences (UI only for now).</p>
        </div>
        <Badge variant="secondary">Preview</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>These toggle points are ready for wiring.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background/40 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Hinglish-friendly outputs</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Keep instructions readable for everyday users.
              </p>
            </div>
            <Badge variant="outline">On</Badge>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background/40 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Compact panels</p>
              <p className="mt-1 text-xs text-muted-foreground">Reduce whitespace to fit more steps.</p>
            </div>
            <Badge variant="outline">Off</Badge>
          </div>

          <Separator />

          <div className="rounded-2xl border border-border bg-accent/20 px-4 py-3 text-sm text-muted-foreground">
            Theme is driven by system preference right now. A toggle can be added later without touching core logic.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

