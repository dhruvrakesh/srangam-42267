import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, ScatterChart as ScatterChartIcon, PieChart as PieChartIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  name: string;
  value: number;
  period?: string;
  type?: string;
  description?: string;
  color?: string;
}

interface ImprovedInteractiveChartProps {
  title: string;
  description: string;
  data: ChartDataPoint[];
  chartType?: 'bar' | 'scatter' | 'pie';
  className?: string;
  showLegend?: boolean;
}

const COLORS = ['#8B5A3C', '#CD853F', '#D2691E', '#F4A460', '#DEB887', '#BC8F8F'];

export const ImprovedInteractiveChart: React.FC<ImprovedInteractiveChartProps> = ({
  title,
  description,
  data,
  chartType = 'bar',
  className,
  showLegend = true
}) => {
  const [activeChart, setActiveChart] = useState(chartType);
  const [selectedDataPoint, setSelectedDataPoint] = useState<ChartDataPoint | null>(null);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{label || data.name}</p>
          <p className="text-primary">
            Value: <span className="font-medium">{payload[0].value}</span>
          </p>
          {data.period && (
            <p className="text-muted-foreground text-sm">Period: {data.period}</p>
          )}
          {data.description && (
            <p className="text-muted-foreground text-sm mt-1">{data.description}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleDataPointClick = (dataPoint: ChartDataPoint) => {
    setSelectedDataPoint(dataPoint);
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          onClick={(data) => handleDataPointClick(data)}
          className="cursor-pointer"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          dataKey="value"
          stroke="hsl(var(--muted-foreground))" 
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter 
          dataKey="value" 
          fill="hsl(var(--primary))"
          onClick={(data) => handleDataPointClick(data)}
          className="cursor-pointer"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
          onClick={(data) => handleDataPointClick(data)}
          className="cursor-pointer"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (activeChart) {
      case 'bar':
        return renderBarChart();
      case 'scatter':
        return renderScatterChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={activeChart === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('bar')}
            >
              <BarChart3 size={16} />
            </Button>
            <Button
              variant={activeChart === 'scatter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('scatter')}
            >
              <ScatterChartIcon size={16} />
            </Button>
            <Button
              variant={activeChart === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChart('pie')}
            >
              <PieChartIcon size={16} />
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        
        {showLegend && (
          <div className="flex flex-wrap gap-2">
            {data.map((item, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
                style={{ 
                  backgroundColor: activeChart === 'pie' ? COLORS[index % COLORS.length] + '20' : undefined,
                  borderColor: activeChart === 'pie' ? COLORS[index % COLORS.length] : undefined
                }}
              >
                {item.name}
                {item.period && ` (${item.period})`}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="w-full">
          {renderChart()}
        </div>
        
        {selectedDataPoint && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">{selectedDataPoint.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Value: <span className="font-medium">{selectedDataPoint.value}</span>
                </p>
                {selectedDataPoint.period && (
                  <p className="text-sm text-muted-foreground">
                    Period: {selectedDataPoint.period}
                  </p>
                )}
                {selectedDataPoint.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedDataPoint.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Sample data for archaeological sites
export const archaeologicalSitesData: ChartDataPoint[] = [
  {
    name: 'Keezhadi',
    value: 600,
    period: '6th century BCE',
    description: 'Revolutionary urban site on Vaigai river with Tamil-Brahmi inscriptions'
  },
  {
    name: 'Adichanallur',
    value: 800,
    period: '1000-600 BCE',
    description: 'Ancient urn-burial site with advanced metallurgical evidence'
  },
  {
    name: 'Arikamedu',
    value: 300,
    period: '3rd century BCE',
    description: 'Indo-Roman trading port, ancient Poduke'
  },
  {
    name: 'Korkai',
    value: 785,
    period: '8th century BCE',
    description: 'Pearl trading capital of Pandya kingdom'
  },
  {
    name: 'Kodumanal',
    value: 500,
    period: '5th century BCE',
    description: 'Industrial center for bead-making and metallurgy'
  }
];