import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain } from 'lucide-react';
import { karewaLayers, crossSectionPoints, lakePhases } from '@/data/geology/kashmir-lake-data';
import type { KarewaLayer } from '@/data/geology/kashmir-lake-data';

export function KashmirLakeTimeline() {
  const [selectedLayer, setSelectedLayer] = useState<KarewaLayer | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const timelineRef = useRef<SVGSVGElement>(null);
  const crossSectionRef = useRef<SVGSVGElement>(null);

  // Client-side mounting check to prevent SSR issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!timelineRef.current) {
      console.warn('Kashmir timeline ref not ready');
      return;
    }

    try {
      const svg = d3.select(timelineRef.current);
      svg.selectAll('*').remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 150, bottom: 40, left: 100 };

    // Y-axis: Time scale using actual data range
    const maxYear = Math.max(...karewaLayers.map(l => l.startYearBP));
    const minYear = 0;
    const yScale = d3.scaleLinear()
      .domain([maxYear, minYear])
      .range([margin.top, height - margin.bottom]);

    // Draw layers
    const layerGroup = svg.append('g');

    karewaLayers.forEach((layer) => {
      const rectHeight = yScale(layer.endYearBP) - yScale(layer.startYearBP);
      
      layerGroup.append('rect')
        .attr('x', margin.left)
        .attr('y', yScale(layer.startYearBP))
        .attr('width', 200)
        .attr('height', rectHeight)
        .attr('fill', layer.color)
        .attr('stroke', '#000')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .on('click', () => setSelectedLayer(layer))
        .on('mouseenter', function() {
          d3.select(this).attr('opacity', 0.8);
        })
        .on('mouseleave', function() {
          d3.select(this).attr('opacity', 1);
        });

      layerGroup.append('text')
        .attr('x', margin.left + 210)
        .attr('y', (yScale(layer.startYearBP) + yScale(layer.endYearBP)) / 2)
        .attr('dy', '0.35em')
        .attr('class', 'text-xs fill-current')
        .text(layer.name);
    });

    // Y-axis
    const yAxis = d3.axisLeft(yScale)
      .tickFormat((d) => `${(d as number) / 1000}k BP`);

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis)
      .attr('class', 'text-xs fill-current');

    // Lake phases markers
    lakePhases.forEach((phase) => {
      svg.append('circle')
        .attr('cx', margin.left + 250)
        .attr('cy', yScale(phase.yearBP))
        .attr('r', 4)
        .attr('fill', '#3b82f6')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      svg.append('text')
        .attr('x', margin.left + 260)
        .attr('y', yScale(phase.yearBP))
        .attr('dy', '0.35em')
        .attr('class', 'text-xs fill-current')
        .text(phase.event);
    });

    // Timeline title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-semibold fill-current')
      .text('Karewa Formation Timeline');
    } catch (error) {
      console.error('D3 timeline rendering error:', error);
    }
  }, []);

  useEffect(() => {
    if (!crossSectionRef.current) {
      console.warn('Kashmir cross-section ref not ready');
      return;
    }

    try {
      const svg = d3.select(crossSectionRef.current);
      svg.selectAll('*').remove();

    const width = 800;
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    // X-axis: Distance using actual data points
    const xScale = d3.scaleLinear()
      .domain([0, crossSectionPoints.length - 1])
      .range([margin.left, width - margin.right]);

    // Y-axis: Elevation
    const yScale = d3.scaleLinear()
      .domain([1400, 1700])
      .range([height - margin.bottom, margin.top]);

    // Draw valley profile
    const profileLine = d3.line<typeof crossSectionPoints[0]>()
      .x((d, i) => xScale(i))
      .y((d) => yScale(d.elevation));

    svg.append('path')
      .datum(crossSectionPoints)
      .attr('d', profileLine)
      .attr('fill', 'none')
      .attr('stroke', '#8b4513')
      .attr('stroke-width', 3);

    // Draw karewa layers at each point
    crossSectionPoints.forEach((point, i) => {
      svg.append('rect')
        .attr('x', xScale(i) - 30)
        .attr('y', yScale(point.elevation) - point.karewaThickness)
        .attr('width', 60)
        .attr('height', point.karewaThickness)
        .attr('fill', '#daa520')
        .attr('stroke', '#000')
        .attr('stroke-width', 1);

      svg.append('text')
        .attr('x', xScale(i))
        .attr('y', height - margin.bottom + 20)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-xs fill-current')
        .text(point.location);

      svg.append('text')
        .attr('x', xScale(i))
        .attr('y', height - margin.bottom + 35)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-xs fill-current text-muted-foreground')
        .text(`${point.karewaThickness}m karewa`);
    });

    // Axes
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(0))
      .attr('class', 'text-xs fill-current');

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat((d) => `${d}m`))
      .attr('class', 'text-xs fill-current');

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-semibold fill-current')
      .text('Kashmir Valley Cross-Section (West to East)');
    } catch (error) {
      console.error('D3 cross-section rendering error:', error);
    }
  }, []);

  // Prevent SSR rendering of D3/client-only visualization
  if (!isMounted) {
    return (
      <Card className="my-8 bg-sandalwood/40 border-burgundy/30">
        <CardContent className="flex items-center justify-center h-64">
          <Mountain className="w-6 h-6 animate-pulse mr-2 text-muted-foreground" />
          <span className="text-muted-foreground">Loading geological timeline...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-8 bg-sandalwood/40 border-burgundy/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mountain className="w-5 h-5 text-laterite" />
          Kashmir Paleolake Stratigraphy: Karewa Deposits Timeline
        </CardTitle>
        <CardDescription>
          Geological evidence of the ancient Satisaras lake through sediment layers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vertical Timeline */}
        <div className="bg-muted/20 rounded-lg p-4 overflow-x-auto">
          <svg
            ref={timelineRef}
            width="800"
            height="600"
            className="max-w-full h-auto"
          />
        </div>

        {/* Cross-Section */}
        <div className="bg-muted/20 rounded-lg p-4 overflow-x-auto">
          <svg
            ref={crossSectionRef}
            width="800"
            height="300"
            className="max-w-full h-auto"
          />
        </div>

        {/* Layer Detail Panel */}
        {selectedLayer && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-2">{selectedLayer.name}</h4>
            <p className="text-sm mb-4 text-muted-foreground">{selectedLayer.description}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-sm mb-2">Composition</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Clay:</span>
                    <span className="font-medium">{selectedLayer.composition.clay}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Silt:</span>
                    <span className="font-medium">{selectedLayer.composition.silt}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sand:</span>
                    <span className="font-medium">{selectedLayer.composition.sand}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volcanic Ash:</span>
                    <span className="font-medium">{selectedLayer.composition.volcanicAsh}%</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <strong>Period:</strong> {selectedLayer.period}
                  <br />
                  <strong>Thickness:</strong> {selectedLayer.thickness}m
                </div>
              </div>

              <div>
                <h5 className="font-medium text-sm mb-2">Fossil Evidence</h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedLayer.fossilEvidence.map((fossil, idx) => (
                    <li key={idx} className="text-muted-foreground">{fossil}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground">
          <strong>Interactive:</strong> Click on colored layers in the timeline to view detailed composition and fossil evidence
        </div>
      </CardContent>
    </Card>
  );
}
