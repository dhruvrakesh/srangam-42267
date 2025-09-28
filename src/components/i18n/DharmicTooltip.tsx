import React from 'react';
import { HelpCircle, BookOpen, Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useLanguagePreferences } from '@/hooks/useLanguagePreferences';
import { getScriptFont } from '@/lib/languageUtils';

interface CulturalTerm {
  term: string;
  iast?: string;
  etymology?: string;
  culturalContext?: string;
  translations?: {
    [key: string]: {
      translation: string;
      explanation?: string;
    };
  };
}

interface DharmicTooltipProps {
  term: string;
  data?: CulturalTerm;
  children: React.ReactNode;
  inline?: boolean;
}

// Sample cultural terms database
const CULTURAL_TERMS: { [key: string]: CulturalTerm } = {
  dharma: {
    term: 'dharma',
    iast: 'dharma',
    etymology: 'From Sanskrit dhṛ (to hold, maintain) + suffix -ma',
    culturalContext: 'Central concept in Indian philosophy referring to righteous duty, moral law, and cosmic order.',
    translations: {
      en: { translation: 'righteousness, duty, cosmic order' },
      hi: { translation: 'धर्म', explanation: 'न्याय, कर्तव्य, और ब्रह्मांडीय व्यवस्था' },
      ta: { translation: 'தர்மம்', explanation: 'நீதி, கடமை, மற்றும் அண்டக் கோட்பாடு' }
    }
  },
  samudra: {
    term: 'samudra',
    iast: 'samudra',
    etymology: 'From Sanskrit sam (together) + udra (water)',
    culturalContext: 'Ocean as a cosmic principle, often representing vastness, depth, and the container of all waters.',
    translations: {
      en: { translation: 'ocean, sea' },
      hi: { translation: 'समुद्र', explanation: 'महासागर, सभी जल का भंडार' },
      ta: { translation: 'கடல்', explanation: 'பெருங்கடல், நீரின் பெரும் கலம்' }
    }
  },
  yuga: {
    term: 'yuga',
    iast: 'yuga',
    etymology: 'From Sanskrit yuj (to join, unite)',
    culturalContext: 'Cosmic age or era in Hindu cosmology, representing cyclical time periods of vast duration.',
    translations: {
      en: { translation: 'age, era, epoch' },
      hi: { translation: 'युग', explanation: 'काल खंड, समयावधि' },
      ta: { translation: 'யுகம்', explanation: 'காலம், சகாப்தம்' }
    }
  },
  manthan: {
    term: 'manthan',
    iast: 'manthana',
    etymology: 'From Sanskrit math (to churn, agitate)',
    culturalContext: 'The churning process, metaphor for extracting essence through sustained effort and cosmic cooperation.',
    translations: {
      en: { translation: 'churning, extraction through effort' },
      hi: { translation: 'मंथन', explanation: 'मथना, परिश्रम से सार निकालना' },
      ta: { translation: 'மந்தனம்', explanation: 'கடைதல், முயற்சியால் சாரம் எடுத்தல்' }
    }
  },
  sangam: {
    term: 'sangam',
    iast: 'saṅgama',
    etymology: 'From Sanskrit sam (together) + gam (to go, meet)',
    culturalContext: 'Confluence, meeting point, especially of waters; also refers to assemblies of learned people.',
    translations: {
      en: { translation: 'confluence, meeting, assembly' },
      hi: { translation: 'संगम', explanation: 'मिलन स्थल, विद्वानों की सभा' },
      ta: { translation: 'சங்கமம்', explanation: 'சங்கமம், அறிஞர்களின் கூட்டம்' }
    }
  }
};

export const DharmicTooltip: React.FC<DharmicTooltipProps> = ({
  term,
  data,
  children,
  inline = true
}) => {
  const { preferences } = useLanguagePreferences();
  
  const termData = data || CULTURAL_TERMS[term.toLowerCase()];
  
  if (!termData) {
    return <span>{children}</span>;
  }

  const currentLang = preferences.primaryLanguage;
  const translation = termData.translations?.[currentLang];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`
            relative cursor-help 
            ${inline ? 'inline-flex items-center' : 'block'}
            underline decoration-dotted decoration-primary/60 underline-offset-2
            hover:decoration-primary transition-colors
          `}>
            {children}
            {inline && (
              <HelpCircle className="h-3 w-3 ml-1 text-primary/60" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-sm p-4 space-y-3"
          sideOffset={5}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base">{termData.term}</h4>
              <Badge variant="outline" className="text-xs">
                Sanskrit
              </Badge>
            </div>
            
            {termData.iast && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">IAST: </span>
                <span className="font-mono text-primary">{termData.iast}</span>
              </div>
            )}

            {translation && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Translation: </span>
                <span className={`${getScriptFont(currentLang)} font-medium`}>
                  {translation.translation}
                </span>
                {translation.explanation && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {translation.explanation}
                  </div>
                )}
              </div>
            )}
          </div>

          {termData.etymology && (
            <div className="border-t pt-2 text-xs">
              <div className="flex items-start gap-2">
                <BookOpen className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="font-medium">Etymology: </span>
                  <span className="text-muted-foreground">{termData.etymology}</span>
                </div>
              </div>
            </div>
          )}

          {termData.culturalContext && (
            <div className="border-t pt-2 text-xs">
              <div className="flex items-start gap-2">
                <Globe className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="font-medium">Cultural Context: </span>
                  <span className="text-muted-foreground">{termData.culturalContext}</span>
                </div>
              </div>
            </div>
          )}

          {preferences.showCulturalContext && (
            <div className="border-t pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>Cultural term tooltip enabled in language preferences</span>
              </div>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Helper component for wrapping text with multiple dharmic terms
export const DharmicText: React.FC<{ 
  children: string;
  terms?: string[];
}> = ({ children, terms = [] }) => {
  if (terms.length === 0) {
    return <span>{children}</span>;
  }

  let processedText = children;
  
  // Replace each term with a DharmicTooltip
  terms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    processedText = processedText.replace(regex, `<dharmic-term>${term}</dharmic-term>`);
  });

  // Split by the custom tags and render appropriately
  const parts = processedText.split(/(<dharmic-term>.*?<\/dharmic-term>)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('<dharmic-term>') && part.endsWith('</dharmic-term>')) {
          const term = part.replace(/<\/?dharmic-term>/g, '');
          return (
            <DharmicTooltip key={index} term={term}>
              {term}
            </DharmicTooltip>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};