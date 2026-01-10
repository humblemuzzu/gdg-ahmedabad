"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const examples = [
  "Ahmedabad me café kholna hai — licenses, timeline, aur total kharcha?",
  "Gujarat me GST registration karna hai — step-by-step checklist",
  "Society NOC ke bina shop license possible hai?",
  "Fire NOC me kya documents lagte hai?",
];

export function ProcessInput() {
  const [value, setValue] = React.useState(examples[0]);
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Describe your goal</CardTitle>
            <CardDescription>Hinglish is fine. Keep it simple.</CardDescription>
          </div>
          <Badge variant="secondary">UI</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Ahmedabad me café kholna hai…"
        />
        <div className="flex flex-wrap gap-2">
          {examples.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                setValue(e);
                setSubmitted(false);
              }}
              className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Backend is not wired yet — this is a production-ready UI shell.
          </p>
          <Button
            type="button"
            onClick={() => setSubmitted(true)}
            aria-label="Generate plan"
          >
            Generate plan
          </Button>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-border bg-primary/10 px-4 py-3 text-sm">
            <p className="font-medium">Preview mode</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing sample timeline, costs, risks, and documents for:{" "}
              <span className="text-foreground">{value}</span>
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
