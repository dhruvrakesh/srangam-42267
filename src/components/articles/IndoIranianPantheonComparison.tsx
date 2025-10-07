import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUp, ArrowDown, Minus, Info } from 'lucide-react';

interface DeityData {
  concept: string;
  vedicName: string;
  vedicStatus: string;
  avestanName: string;
  avestanStatus: string;
  trajectory: 'elevated' | 'demonized' | 'retained' | 'removed';
  explanation: string;
  protoForm?: string;
}

const deityData: DeityData[] = [
  {
    concept: "Class of High Gods",
    vedicName: "Asura",
    vedicStatus: "Powerful God (later Demon)",
    avestanName: "Ahura",
    avestanStatus: "God, esp. Ahura Mazda",
    trajectory: "elevated",
    explanation: "In Iran, Ahura became the supreme designation for divinity, culminating in Ahura Mazda. In India, Asura gradually acquired demonic connotations.",
    protoForm: "*Asura - 'Powerful Lord'"
  },
  {
    concept: "Class of Other Gods",
    vedicName: "Deva",
    vedicStatus: "God",
    avestanName: "Daeva",
    avestanStatus: "Demon, False God",
    trajectory: "demonized",
    explanation: "The Deva class was elevated to supreme status in Vedic India, while Zarathustra explicitly condemned them as demons in the Avesta.",
    protoForm: "*Daiva - 'Shining/Heavenly One'"
  },
  {
    concept: "Warrior God",
    vedicName: "Indra",
    vedicStatus: "Chief of Devas, King of Gods",
    avestanName: "Iṇdra",
    avestanStatus: "Arch-demon",
    trajectory: "demonized",
    explanation: "The central figure of the schism. Indra became the paramount deity in the Rigveda with 250+ hymns dedicated to him, while in the Avesta he is explicitly named as a chief demon.",
    protoForm: "*Indra - 'Powerful/Victorious'"
  },
  {
    concept: "Sovereign God",
    vedicName: "Varuṇa",
    vedicStatus: "Important Asura, guardian of Ṛta",
    avestanName: "Ahura Mazda (absorbed)",
    avestanStatus: "Supreme God",
    trajectory: "elevated",
    explanation: "Varuna's role as cosmic sovereign and guardian of truth (Ṛta/Asha) was absorbed by Ahura Mazda in Iranian tradition. In India, he was gradually superseded by Indra.",
    protoForm: "*Varu-na - 'Encompasser'"
  },
  {
    concept: "Covenant God",
    vedicName: "Mitra",
    vedicStatus: "Important Asura/Aditya",
    avestanName: "Mithra",
    avestanStatus: "Powerful Yazata",
    trajectory: "retained",
    explanation: "The god of covenants and contracts maintained high status in both traditions. His cult was too fundamental to social order to demonize.",
    protoForm: "*Mitra - 'Contract/Friendship'"
  },
  {
    concept: "Divine Twins",
    vedicName: "Nāsatya (Ashvins)",
    vedicStatus: "Benevolent Devas",
    avestanName: "Nåŋhaiθiia",
    avestanStatus: "Demon (paired with Iṇdra)",
    trajectory: "demonized",
    explanation: "The divine twin horsemen, physicians of the gods in Vedic tradition, were demonized in the Avesta as part of the general rejection of the Daevas.",
    protoForm: "*Nasatya - 'Truth-speakers'"
  },
  {
    concept: "First Mortal / King of Dead",
    vedicName: "Yama",
    vedicStatus: "Lord of the Dead",
    avestanName: "Yima",
    avestanStatus: "First King, golden age ruler",
    trajectory: "retained",
    explanation: "Both traditions preserved this figure as the first mortal, though his role shifted: from death lord in India to golden age king in Iran.",
    protoForm: "*Yama - 'Twin'"
  },
  {
    concept: "Cosmic Order / Truth",
    vedicName: "Ṛta",
    vedicStatus: "Cosmic Law",
    avestanName: "Asha",
    avestanStatus: "Cosmic Truth",
    trajectory: "retained",
    explanation: "The fundamental concept of cosmic order was retained by both traditions. Each faction claimed to be the true defender of this principle.",
    protoForm: "*Ṛta - 'Right Order'"
  }
];

export const IndoIranianPantheonComparison: React.FC = () => {
  const [showProto, setShowProto] = useState(false);

  const getTrajectoryIcon = (trajectory: DeityData['trajectory']) => {
    switch (trajectory) {
      case 'elevated':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'demonized':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'retained':
        return <Minus className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getTrajectoryColor = (trajectory: DeityData['trajectory']) => {
    switch (trajectory) {
      case 'elevated':
        return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
      case 'demonized':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      case 'retained':
        return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full my-8">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">The Indo-Iranian Pantheon: A Study in Divergence</CardTitle>
            <CardDescription>
              Interactive comparison of deity transformations during the Vedic-Zoroastrian schism
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="proto-view"
              checked={showProto}
              onCheckedChange={setShowProto}
            />
            <Label htmlFor="proto-view" className="text-sm font-medium cursor-pointer">
              {showProto ? 'Proto-Indo-Iranian View' : 'Post-Schism View'}
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <ArrowUp className="w-4 h-4 text-green-600" />
            <span className="text-sm">Elevated in Iran</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDown className="w-4 h-4 text-red-600" />
            <span className="text-sm">Demonized</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-yellow-600" />
            <span className="text-sm">Retained in both</span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left p-3 font-semibold">Concept</th>
                {showProto && <th className="text-left p-3 font-semibold">Proto Form</th>}
                <th className="text-left p-3 font-semibold">Vedic Tradition</th>
                <th className="text-left p-3 font-semibold">Avestan Tradition</th>
                <th className="text-center p-3 font-semibold">Trajectory</th>
              </tr>
            </thead>
            <tbody>
              {deityData.map((deity, index) => (
                <tr
                  key={index}
                  className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${getTrajectoryColor(deity.trajectory)}`}
                >
                  <td className="p-3 font-medium">{deity.concept}</td>
                  {showProto && (
                    <td className="p-3">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{deity.protoForm}</code>
                    </td>
                  )}
                  <td className="p-3">
                    <div className="font-semibold text-primary">{deity.vedicName}</div>
                    <div className="text-sm text-muted-foreground">{deity.vedicStatus}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-primary">{deity.avestanName}</div>
                    <div className="text-sm text-muted-foreground">{deity.avestanStatus}</div>
                  </td>
                  <td className="p-3 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="inline-flex items-center gap-2 p-2 rounded-lg hover:bg-background/80 transition-colors">
                            {getTrajectoryIcon(deity.trajectory)}
                            <Info className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">{deity.explanation}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {deityData.map((deity, index) => (
            <Card key={index} className={`${getTrajectoryColor(deity.trajectory)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{deity.concept}</CardTitle>
                  {getTrajectoryIcon(deity.trajectory)}
                </div>
                {showProto && deity.protoForm && (
                  <code className="text-sm bg-muted px-2 py-1 rounded block w-fit">{deity.protoForm}</code>
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <Badge variant="outline" className="mb-1">Vedic</Badge>
                  <div className="font-semibold">{deity.vedicName}</div>
                  <div className="text-muted-foreground">{deity.vedicStatus}</div>
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">Avestan</Badge>
                  <div className="font-semibold">{deity.avestanName}</div>
                  <div className="text-muted-foreground">{deity.avestanStatus}</div>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground italic">{deity.explanation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Methodological Note:</p>
          <p>
            This comparison is based on linguistic cognates and comparative mythology. The "trajectory" 
            indicates the relative status change of each deity/concept between the two traditions. 
            The hostile inversion of Asura/Ahura and Deva/Daeva is unique in comparative religion and 
            strongly suggests a historical schism rather than gradual divergence.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
