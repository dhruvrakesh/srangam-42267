import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Search, Filter, Calendar, Copy, RotateCcw, Download, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { useLanguagePreferences } from '@/hooks/useLanguagePreferences';

interface AtlasNode {
  id: string;
  title: { [key: string]: string };
  type: 'port' | 'city' | 'fort' | 'inscription' | 'coin_hoard' | 'waypoint';
  category: string;
  period: { start: number; end: number };
  summary: { [key: string]: string };
  tags: string[];
  sources: string[];
  articleSlug?: string;
  confidence: 'high' | 'medium' | 'approximate';
  approximate?: boolean;
  coordinates: [number, number];
}

interface AtlasRoute {
  id: string;
  name: { [key: string]: string };
  period: { start: number; end: number };
  confidence: string;
  coordinates: [number, number][];
}

interface InteractiveAtlasProps {
  selectedId?: string;
  onNodeSelect?: (node: AtlasNode | null) => void;
}

const TYPE_COLORS = {
  port: '#3b82f6',
  city: '#8b5cf6', 
  fort: '#ef4444',
  inscription: '#f59e0b',
  coin_hoard: '#10b981',
  waypoint: '#6b7280'
};

const BOUNDS: [[number, number], [number, number]] = [
  [30, -30],
  [130, 40]
];

export const InteractiveAtlas: React.FC<InteractiveAtlasProps> = ({
  selectedId,
  onNodeSelect
}) => {
  const { t, i18n } = useTranslation();
  const { preferences } = useLanguagePreferences();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);
  
  const [nodes, setNodes] = useState<AtlasNode[]>([]);
  const [routes, setRoutes] = useState<AtlasRoute[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['port', 'city', 'inscription']);
  const [timeRange, setTimeRange] = useState([-500, 1500]);
  const [showRoutes, setShowRoutes] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [nodesRes, routesRes] = await Promise.all([
          fetch('/atlas/atlas_nodes.json'),
          fetch('/atlas/routes.json')
        ]);
        
        const nodesData = await nodesRes.json();
        const routesData = await routesRes.json();

        const processedNodes: AtlasNode[] = nodesData.features.map((feature: any) => ({
          id: feature.properties.id,
          title: feature.properties.title,
          type: feature.properties.type,
          category: feature.properties.category,
          period: feature.properties.period,
          summary: feature.properties.summary,
          tags: feature.properties.tags,
          sources: feature.properties.sources,
          articleSlug: feature.properties.articleSlug,
          confidence: feature.properties.confidence,
          approximate: feature.properties.approximate,
          coordinates: feature.geometry.coordinates
        }));

        const processedRoutes: AtlasRoute[] = routesData.features.map((feature: any) => ({
          id: feature.properties.id,
          name: feature.properties.name,
          period: feature.properties.period,
          confidence: feature.properties.confidence,
          coordinates: feature.geometry.coordinates
        }));

        setNodes(processedNodes);
        setRoutes(processedRoutes);
      } catch (error) {
        console.error('Failed to load atlas data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || loading) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: [78, 12],
      zoom: 4,
      maxBounds: BOUNDS
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Initialize popup
    popup.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      className: 'atlas-popup'
    });

    return () => {
      map.current?.remove();
    };
  }, [loading]);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = searchTerm === '' || 
        Object.values(node.title).some(title => 
          title.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        node.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedTypes.includes(node.type);
      const matchesTime = node.period.start <= timeRange[1] && node.period.end >= timeRange[0];
      
      return matchesSearch && matchesType && matchesTime;
    });
  }, [nodes, searchTerm, selectedTypes, timeRange]);

  // Update map data
  useEffect(() => {
    if (!map.current || loading) return;

    const updateMapData = () => {
      // Clear existing sources and layers
      if (map.current!.getSource('nodes')) {
        map.current!.removeLayer('nodes');
        map.current!.removeSource('nodes');
      }
      if (map.current!.getSource('routes')) {
        map.current!.removeLayer('routes');
        map.current!.removeSource('routes');
      }

      // Add nodes
      const nodesGeoJSON: any = {
        type: 'FeatureCollection',
        features: filteredNodes.map(node => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: node.coordinates
          },
          properties: {
            ...node,
            color: TYPE_COLORS[node.type]
          }
        }))
      };

      map.current!.addSource('nodes', {
        type: 'geojson',
        data: nodesGeoJSON,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Clustered points
      map.current!.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'nodes',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f28cb1',
            750,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      // Cluster count labels
      map.current!.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'nodes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      // Individual points
      map.current!.addLayer({
        id: 'nodes',
        type: 'circle',
        source: 'nodes',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add routes if enabled
      if (showRoutes && routes.length > 0) {
        const routesGeoJSON: any = {
          type: 'FeatureCollection',
          features: routes.map(route => ({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: route.coordinates
            },
            properties: route
          }))
        };

        map.current!.addSource('routes', {
          type: 'geojson',
          data: routesGeoJSON
        });

        map.current!.addLayer({
          id: 'routes',
          type: 'line',
          source: 'routes',
          paint: {
            'line-color': '#ff6b6b',
            'line-width': 2,
            'line-dasharray': [2, 2]
          }
        });
      }

      // Add click handlers
      map.current!.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties!.cluster_id;
        const source = map.current!.getSource('nodes') as any;
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          map.current!.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom
          });
        });
      });

      map.current!.on('click', 'nodes', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const node = nodes.find(n => n.id === feature.properties!.id);
          if (node) {
            showNodePopup(node, e.lngLat);
            onNodeSelect?.(node);
          }
        }
      });

      // Change cursor on hover
      map.current!.on('mouseenter', 'clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current!.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = '';
      });
      map.current!.on('mouseenter', 'nodes', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current!.on('mouseleave', 'nodes', () => {
        map.current!.getCanvas().style.cursor = '';
      });
    };

    if (map.current.isStyleLoaded()) {
      updateMapData();
    } else {
      map.current.on('styledata', updateMapData);
    }
  }, [filteredNodes, showRoutes, routes, nodes, onNodeSelect]);

  const showNodePopup = (node: AtlasNode, lngLat: maplibregl.LngLat) => {
    if (!popup.current || !map.current) return;

    const currentLang = preferences.primaryLanguage;
    const title = node.title[currentLang] || node.title.en || node.id;
    const summary = node.summary[currentLang] || node.summary.en || '';

    const popupContent = `
      <div class="p-4 max-w-sm">
        <h3 class="font-bold text-lg mb-2">${title}</h3>
        <div class="flex gap-2 mb-2">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ${node.type}
          </span>
          ${node.approximate ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Approx.</span>' : ''}
        </div>
        <p class="text-sm text-gray-600 mb-3">${summary.substring(0, 200)}${summary.length > 200 ? '...' : ''}</p>
        ${node.articleSlug ? `<a href="/articles/${node.articleSlug}" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Read Article →</a>` : ''}
      </div>
    `;

    popup.current
      .setLngLat(lngLat)
      .setHTML(popupContent)
      .addTo(map.current);
  };

  const handleResetView = () => {
    if (map.current) {
      map.current.fitBounds(BOUNDS, { padding: 50 });
    }
  };

  const handleCopyLink = () => {
    const url = selectedId 
      ? `${window.location.origin}/atlas?id=${selectedId}&lang=${i18n.language}`
      : `${window.location.origin}/atlas?lang=${i18n.language}`;
    navigator.clipboard.writeText(url);
  };

  const handleExport = () => {
    const exportData = {
      nodes: filteredNodes,
      routes: showRoutes ? routes : [],
      filters: {
        search: searchTerm,
        types: selectedTypes,
        timeRange,
        showRoutes
      },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srangam-atlas-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center space-x-2">
          <Globe className="animate-spin h-8 w-8 text-primary" />
          <span className="text-lg">Loading Atlas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <div className={`bg-background border-r transition-all duration-300 ${sidebarCollapsed ? 'w-0' : 'w-80'} flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Interactive Atlas</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type filters */}
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-medium">Node Types</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <Button
                  key={type}
                  variant={selectedTypes.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedTypes(prev => 
                      prev.includes(type) 
                        ? prev.filter(t => t !== type)
                        : [...prev, type]
                    );
                  }}
                  className="capitalize"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: color }} 
                  />
                  {type.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-medium">Time Period</h3>
            <div className="px-2">
              <Slider
                value={timeRange}
                onValueChange={setTimeRange}
                min={-500}
                max={1500}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{timeRange[0]} CE</span>
                <span>{timeRange[1]} CE</span>
              </div>
            </div>
          </div>

          {/* Routes toggle */}
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium">Show Routes</label>
            <Switch
              checked={showRoutes}
              onCheckedChange={setShowRoutes}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleResetView}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Node list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {filteredNodes.length} nodes found
            </p>
            {filteredNodes.map(node => {
              const currentLang = preferences.primaryLanguage;
              const title = node.title[currentLang] || node.title.en || node.id;
              
              return (
                <Card 
                  key={node.id} 
                  className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    if (map.current) {
                      map.current.flyTo({
                        center: node.coordinates,
                        zoom: 10
                      });
                      showNodePopup(node, new maplibregl.LngLat(node.coordinates[0], node.coordinates[1]));
                      onNodeSelect?.(node);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{title}</h4>
                      <div className="flex gap-1 mt-1">
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          style={{ backgroundColor: `${TYPE_COLORS[node.type]}20`, color: TYPE_COLORS[node.type] }}
                        >
                          {node.type}
                        </Badge>
                        {node.approximate && (
                          <Badge variant="outline" className="text-xs">
                            Approx.
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Collapse toggle for mobile */}
        <Button
          className="absolute top-4 left-4 z-10 lg:hidden"
          variant="secondary"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};