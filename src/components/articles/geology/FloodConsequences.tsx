import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FloodConsequences = () => (
  <div className="space-y-4">
    <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
      Consequences of the 1341 Flood
    </h3>
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="bg-card border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
            <div className="w-2 h-2 bg-destructive rounded-full"></div>
            Muziris Abandoned
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            The ancient port was completely silted over, ending nearly 2,000 years of continuous maritime trade
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-ocean/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-ocean flex items-center gap-2">
            <div className="w-2 h-2 bg-ocean rounded-full"></div>
            Kochi's Birth
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            The new river mouth created the protected harbor that would become modern Kochi
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-sage/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-sage flex items-center gap-2">
            <div className="w-2 h-2 bg-sage rounded-full"></div>
            New Landforms Created
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Islands like Vypin were formed from deposited sediments, reshaping the coastline
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-amber/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-amber flex items-center gap-2">
            <div className="w-2 h-2 bg-amber rounded-full"></div>
            Commercial Shift
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Merchant families relocated from Kodungallur to the new port facilities
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
);