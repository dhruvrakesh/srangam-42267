import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CulturalTermsExplorer() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Cultural Terms Explorer
        </h2>
        <p className="text-muted-foreground">
          Browse and manage Sanskrit and cultural terminology
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cultural terms table with search, translation management, and usage analytics will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
