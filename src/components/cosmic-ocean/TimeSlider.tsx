import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import cosmicOceanI18n from '@/data/cosmic_ocean/i18n.json';
import layersData from '@/data/cosmic_ocean/layers.json';

interface TimeSliderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export function TimeSlider({ selectedPeriod, onPeriodChange }: TimeSliderProps) {
  const periods = layersData.map.filters.period_bands;

  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <Label htmlFor="time-period" className="text-sm font-medium whitespace-nowrap">
        {cosmicOceanI18n.labels.time_period}:
      </Label>
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select time period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Periods</SelectItem>
          {periods.map((period) => (
            <SelectItem key={period} value={period}>
              {period}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}