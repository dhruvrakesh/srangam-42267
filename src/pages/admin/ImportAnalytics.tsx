import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImportAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Import Analytics
        </h2>
        <p className="text-muted-foreground">
          Track article import trends and statistics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Import timeline, success rates, and contributor statistics will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
