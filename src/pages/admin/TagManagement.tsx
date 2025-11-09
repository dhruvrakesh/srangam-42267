import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TagManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Tag Management
        </h2>
        <p className="text-muted-foreground">
          Manage and analyze AI-generated tags
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Tag management interface with search, categorization, and network visualization will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
