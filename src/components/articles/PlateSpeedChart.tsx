import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PLATE_SPEED } from '@/data/siteData';

export function PlateSpeedChart() {
  // Transform data for chart
  const chartData = PLATE_SPEED.map(point => ({
    age: `${point.Ma} Ma`,
    speed: point.cm_per_yr,
    fullAge: point.Ma
  })).reverse(); // Reverse to show chronological order

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-foreground">Indian Plate Speed Over Time</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="age" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: 'Speed (cm/yr)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value) => [`${value} cm/yr`, 'Plate Speed']}
            />
            <Bar 
              dataKey="speed" 
              fill="hsl(var(--laterite))"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-2">
        <p>
          <strong>Peak speed:</strong> 18 cm/yr during the Cretaceous "sprint" phase (70 Ma)
        </p>
        <p>
          <strong>Current speed:</strong> 4 cm/yr as the plate continues northward collision with Eurasia
        </p>
      </div>
    </div>
  );
}