"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProcess } from "@/lib/mock/process";

export function DocumentChecklist() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const done = mockProcess.documents.filter((d) => checked[d.id]).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Keep these ready before you start</CardDescription>
          </div>
          <Badge variant="secondary">
            {done}/{mockProcess.documents.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {mockProcess.documents.map((doc) => (
          <label
            key={doc.id}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background/40 px-4 py-3 hover:bg-muted/40 transition-colors"
          >
            <input
              type="checkbox"
              checked={Boolean(checked[doc.id])}
              onChange={(e) => setChecked((prev) => ({ ...prev, [doc.id]: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border border-border accent-primary"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {doc.title}{" "}
                {doc.optional ? (
                  <span className="text-xs font-medium text-muted-foreground">(optional)</span>
                ) : null}
              </p>
            </div>
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
