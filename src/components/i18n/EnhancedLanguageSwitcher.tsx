import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { useLanguagePreferences } from '@/hooks/useLanguagePreferences';
import { getLanguageInfo, getScriptFont } from '@/lib/languageUtils';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'latin' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'devanagari' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'tamil' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'telugu' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'kannada' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'bengali' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'gurmukhi' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'bengali' },
  { code: 'pn', name: 'Pali', nativeName: 'पाळि', script: 'devanagari' }
];

interface EnhancedLanguageSwitcherProps {
  compact?: boolean;
  showLabel?: boolean;
}

export const EnhancedLanguageSwitcher: React.FC<EnhancedLanguageSwitcherProps> = ({
  compact = false,
  showLabel = true
}) => {
  const { i18n } = useTranslation();
  const { preferences, updatePreferences } = useLanguagePreferences();
  const [open, setOpen] = useState(false);

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      updatePreferences({ primaryLanguage: languageCode as any });
      
      // Update URL to preserve language preference
      const url = new URL(window.location.href);
      url.searchParams.set('lang', languageCode);
      window.history.replaceState({}, '', url.toString());
      
      setOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  if (compact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Change language"
          >
            <Globe className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="end">
          <Command>
            <CommandInput placeholder="Search languages..." />
            <CommandList>
              <CommandEmpty>No languages found.</CommandEmpty>
              <CommandGroup>
                {SUPPORTED_LANGUAGES.map((language) => (
                  <CommandItem
                    key={language.code}
                    value={language.code}
                    onSelect={() => handleLanguageChange(language.code)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={getScriptFont(language.code)}>
                        {language.nativeName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {language.name}
                      </span>
                    </div>
                    {currentLanguage.code === language.code && (
                      <Check className="h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">
          Language:
        </span>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="justify-between min-w-[120px]">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span className={getScriptFont(currentLanguage.code)}>
                {currentLanguage.nativeName}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <Command>
            <CommandInput placeholder="Search languages..." className="h-9" />
            <CommandList>
              <CommandEmpty>No languages found.</CommandEmpty>
              <CommandGroup>
                {SUPPORTED_LANGUAGES.map((language) => (
                  <CommandItem
                    key={language.code}
                    value={`${language.name} ${language.nativeName}`}
                    onSelect={() => handleLanguageChange(language.code)}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${getScriptFont(language.code)}`}>
                          {language.nativeName}
                        </span>
                        {currentLanguage.code === language.code && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {language.name} • {language.script} script
                      </span>
                    </div>
                    {currentLanguage.code === language.code && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          
          <div className="border-t p-3">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Language preference is saved automatically</p>
              <p>• Cultural terms show IAST transliteration</p>
              <p>• Script-appropriate fonts are applied</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};