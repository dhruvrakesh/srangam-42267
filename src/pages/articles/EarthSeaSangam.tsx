import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconBasalt } from '@/components/icons';
import { earthSeaSangam } from '@/data/articles/earth-sea-sangam';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { PlateSpeedChart } from '@/components/articles/PlateSpeedChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FloodConsequences, 
  GeologicalTriggers, 
  CoastalEvolutionTimeline, 
  PortMigrationMap, 
  SeaLevelChart 
} from '@/components/articles/geology';

export default function EarthSeaSangam() {
  return (
    <ArticlePage
      title={earthSeaSangam.title}
      dek={earthSeaSangam.dek}
      content={earthSeaSangam.content}
      tags={earthSeaSangam.tags}
      icon={IconBasalt}
      readTime={16}
      author="Nartiang Foundation"
      date="2024-03-28"
      dataComponents={[
        <ResponsiveImage
          key="manuscript"
          src="/lovable-uploads/22a4564d-b68b-4de5-891a-57f148d12703.png"
          alt="Ancient coastal survey manuscript showing geological observations"
          caption="Ancient palm-leaf manuscript containing geological observations of coastal changes, from the Kerala State Archives"
        />,
        <ResponsiveImage 
          key="sea-level-image"
          src="/images/geology/sea-level-rise-gulf-mannar.jpg"
          alt="Scientific visualization of post-glacial sea level rise in the Gulf of Mannar showing submerged landbridge between India and Sri Lanka"
          aspectRatio="landscape"
          caption="Submerged landscapes of the Gulf of Mannar: Evidence for the 'Kumari Kandam' tradition"
          credit="Oceanographic survey data"
        />,
        <GeologicalTriggers key="triggers" />,
        <FloodConsequences key="consequences" />,
        <PortMigrationMap key="migration" />,
        <SeaLevelChart key="sea-level" />,
        <PlateSpeedChart key="plate-speed" />,
        <Card key="trilogy-nav" className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-foreground">
              Maritime Memories of South India: Complete Trilogy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Badge variant="secondary">Part 1</Badge>
                <h4 className="font-medium text-foreground">Emporia of the Ocean</h4>
                <p className="text-sm text-muted-foreground">Archaeological evidence of Indo-Roman trade networks</p>
                <a href="/maritime-memories-south-india" className="text-ocean hover:text-ocean/80 text-sm font-medium">
                  → Read Part 1
                </a>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Part 2</Badge>
                <h4 className="font-medium text-foreground">Riders on the Monsoon</h4>
                <p className="text-sm text-muted-foreground">Indigenous navigation and maritime knowledge systems</p>
                <a href="/riders-on-monsoon" className="text-ocean hover:text-ocean/80 text-sm font-medium">
                  → Read Part 2
                </a>
              </div>
              <div className="space-y-2">
                <Badge variant="default">Part 3 - Current</Badge>
                <h4 className="font-medium text-foreground">Earth, Sea and Sangam</h4>
                <p className="text-sm text-muted-foreground">Geological forces shaping maritime history</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ]}
    />
  );
}