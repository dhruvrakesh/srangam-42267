import { BookOpen, Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagChip } from "@/components/ui/TagChip";

export default function FieldNotes() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BookOpen size={64} className="text-ocean" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Field Notes
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Updates from ongoing fieldwork, new discoveries, and research in progress. 
            Follow our journey as we uncover the material traces of Indian Ocean histories.
          </p>
        </div>

        {/* Sample Field Notes */}
        <div className="space-y-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="font-serif text-xl text-foreground">
                  Ceramic Analysis from Berenike Harbor
                </CardTitle>
                <TagChip variant="theme">
                  Active Research
                </TagChip>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>March 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>Red Sea Coast, Egypt</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Latest findings from our ceramic assemblage analysis reveal new insights into 
                Indo-Roman trade patterns. The presence of specific fabric types suggests 
                direct maritime connections between Muziris and Red Sea ports.
              </p>
              <div className="flex gap-2">
                <TagChip>ceramics</TagChip>
                <TagChip>trade routes</TagChip>
                <TagChip>Roman period</TagChip>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="font-serif text-xl text-foreground">
                  Monsoon Navigation Texts Discovery
                </CardTitle>
                <TagChip variant="theme">
                  Recent Find
                </TagChip>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>February 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>Kerala Archives</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Uncovered palm leaf manuscripts containing detailed descriptions of monsoon 
                timing and navigation techniques. These texts provide crucial evidence for 
                indigenous maritime knowledge systems.
              </p>
              <div className="flex gap-2">
                <TagChip>manuscripts</TagChip>
                <TagChip>navigation</TagChip>
                <TagChip>monsoon</TagChip>
                <TagChip>palm leaf</TagChip>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="font-serif text-xl text-foreground">
                  Geological Survey: Tectonic Movements & Port Locations
                </CardTitle>
                <TagChip variant="theme">
                  Ongoing
                </TagChip>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>January 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>Western Ghats</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Investigating how geological changes over deep time affected the viability 
                of ancient port sites. Preliminary findings suggest significant coastal 
                changes that explain the abandonment of certain harbors.
              </p>
              <div className="flex gap-2">
                <TagChip>geology</TagChip>
                <TagChip>deep time</TagChip>
                <TagChip>ports</TagChip>
                <TagChip>coastal change</TagChip>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}