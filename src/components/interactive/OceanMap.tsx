import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type LayerToggles = { 
  ports: boolean; 
  monsoon: boolean; 
  routes: boolean; 
};

interface OceanMapProps {
  className?: string;
  selectedFilters?: string[];
  selectedPeriod?: string;
  enabledLayers?: string[];
  onLayerToggle?: (layerId: string) => void;
  showEvidence?: boolean;
}

const STYLE_WITH_TOKEN = (token?: string) =>
  token
    ? `https://api.mapbox.com/styles/v1/mapbox/light-v11?access_token=${token}`
    : 'https://demotiles.maplibre.org/style.json';

const DATA_ENDPOINTS = {
  ports: '/data/cosmic_ocean_ports.geojson',
  monsoon: '/data/cosmic_ocean_monsoon.geojson', 
  routes: '/data/cosmic_ocean_routes.geojson',
};

export function OceanMap({ 
  className,
  selectedFilters = [],
  selectedPeriod = 'all',
  enabledLayers = ['ports'],
  onLayerToggle,
  showEvidence = false
}: OceanMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [token, setToken] = useState<string | undefined>(
    import.meta?.env?.VITE_MAPBOX_TOKEN || localStorage.getItem('MAPBOX_TOKEN') || undefined
  );
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Debug: Log enabledLayers changes
  useEffect(() => {
    console.log('OceanMap enabledLayers changed:', enabledLayers);
  }, [enabledLayers]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_WITH_TOKEN(token),
      center: [78, 12], // Indian Ocean focus [lng, lat]
      zoom: 4.2, // Better zoom for Indian Ocean region
      maxBounds: [[40, -20], [120, 40]], // Restrict to Indian Ocean region
      attributionControl: false,
      hash: false,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', async () => {
      try {
        console.log('Map loaded, adding data sources...');
        
        // Load and add ports layer with error handling
        try {
          const portsResponse = await fetch(DATA_ENDPOINTS.ports);
          if (!portsResponse.ok) throw new Error(`Failed to load ports: ${portsResponse.status}`);
          const portsData = await portsResponse.json();
          console.log('Ports data loaded:', portsData.features?.length, 'features');
          
          map.addSource('ports', {
            type: 'geojson',
            data: portsData,
            cluster: true,
            clusterRadius: 40,
            clusterMaxZoom: 7,
          });
        } catch (err) {
          console.error('Failed to load ports data:', err);
          setMapError('Failed to load ports data');
        }

        // Clustered ports
        map.addLayer({
          id: 'ports-clusters',
          type: 'circle',
          source: 'ports',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': 'hsl(var(--gold))',
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              12, 10, 16, 30, 22, 100, 28
            ],
            'circle-opacity': 0.85,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'hsl(var(--background))',
          },
        });

        // Cluster count labels
        map.addLayer({
          id: 'ports-cluster-count',
          type: 'symbol',
          source: 'ports',
          filter: ['has', 'point_count'],
          layout: { 
            'text-field': ['get', 'point_count_abbreviated'], 
            'text-size': 12,
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
          },
          paint: { 'text-color': 'hsl(var(--background))' },
        });

        // Individual ports
        map.addLayer({
          id: 'ports-unclustered',
          type: 'circle',
          source: 'ports',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': 'hsl(var(--gold))',
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 4, 10, 8],
            'circle-stroke-width': 2,
            'circle-stroke-color': 'hsl(var(--background))',
            'circle-opacity': 0.9,
          },
        });

        // Load monsoon layer with error handling
        try {
          const monsoonResponse = await fetch(DATA_ENDPOINTS.monsoon);
          if (!monsoonResponse.ok) throw new Error(`Failed to load monsoon: ${monsoonResponse.status}`);
          const monsoonData = await monsoonResponse.json();
          console.log('Monsoon data loaded:', monsoonData.features?.length, 'features');
          
          map.addSource('monsoon', { 
            type: 'geojson', 
            data: monsoonData 
          });
          
          map.addLayer({
            id: 'monsoon-lines',
            type: 'line',
            source: 'monsoon',
            paint: {
              'line-color': 'hsl(var(--ocean))',
              'line-width': ['interpolate', ['linear'], ['zoom'], 3, 2, 6, 4],
              'line-opacity': 0.8,
            },
            layout: { 'line-cap': 'round', 'line-join': 'round' },
          });
        } catch (err) {
          console.error('Failed to load monsoon data:', err);
        }

        // Load routes layer with error handling
        try {
          const routesResponse = await fetch(DATA_ENDPOINTS.routes);
          if (!routesResponse.ok) throw new Error(`Failed to load routes: ${routesResponse.status}`);
          const routesData = await routesResponse.json();
          console.log('Routes data loaded:', routesData.features?.length, 'features');
          
          map.addSource('routes', { 
            type: 'geojson', 
            data: routesData 
          });
          
          map.addLayer({
            id: 'routes-lines',
            type: 'line',
            source: 'routes',
            paint: {
              'line-color': 'hsl(var(--laterite))',
              'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1.5, 6, 3],
              'line-dasharray': [2, 2],
              'line-opacity': 0.9,
            },
            layout: { 'line-cap': 'round', 'line-join': 'round' },
          });
        } catch (err) {
          console.error('Failed to load routes data:', err);
        }

        // Set initial layer visibility - wait for layers to be added
        setTimeout(() => {
          console.log('Setting initial layer visibility:', enabledLayers);
          setLayerVisibility(map, 'ports', enabledLayers.includes('ports'));
          setLayerVisibility(map, 'monsoon', enabledLayers.includes('monsoon'));
          setLayerVisibility(map, 'routes', enabledLayers.includes('routes'));
        }, 100);

        // Port click handlers
        map.on('click', 'ports-unclustered', (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const p = f.properties || {};
          
          const html = `
            <div class="min-w-[240px] p-2">
              <h3 class="font-serif font-semibold text-base mb-2 text-foreground">${p.name || 'Port'}</h3>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Region:</span>
                  <span class="text-foreground">${p.region || 'Unknown'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Period:</span>
                  <span class="text-foreground">${p.period_band || 'Unknown'}</span>
                </div>
                ${p.evidence_types ? `
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Evidence:</span>
                    <span class="text-foreground">${p.evidence_types}</span>
                  </div>
                ` : ''}
              </div>
              ${p.description ? `
                <p class="mt-2 text-xs text-muted-foreground">${p.description}</p>
              ` : ''}
            </div>`;
            
          new Popup({ 
            offset: 15,
            className: 'ocean-map-popup'
          })
            .setLngLat((f.geometry as any).coordinates)
            .setHTML(html)
            .addTo(map);
        });

        // Cluster click handler
        map.on('click', 'ports-clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['ports-clusters'] });
          const clusterId = features[0].properties?.cluster_id;
          const source = map.getSource('ports') as any;
          
          source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return;
            map.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom
            });
          });
        });

        // Cursor handling
        map.on('mouseenter', 'ports-unclustered', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'ports-unclustered', () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'ports-clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'ports-clusters', () => { map.getCanvas().style.cursor = ''; });

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading map data:', error);
        setIsLoading(false);
      }
    });

    // Responsive handling
    const ro = new ResizeObserver(() => map.resize());
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // Update layer visibility when enabledLayers change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    
    console.log('Updating layer visibility:', enabledLayers);
    
    // Wait for layers to be fully loaded before setting visibility
    setTimeout(() => {
      setLayerVisibility(map, 'ports', enabledLayers.includes('ports'));
      setLayerVisibility(map, 'monsoon', enabledLayers.includes('monsoon'));
      setLayerVisibility(map, 'routes', enabledLayers.includes('routes'));
    }, 50);
  }, [enabledLayers]);

  const handleExportData = () => {
    const exportData = {
      layers: enabledLayers,
      filters: selectedFilters,
      period: selectedPeriod,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ocean_map_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Export Button Only */}
      <div className="flex justify-end gap-2 mb-4">
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportData}
        >
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
        {!token && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTokenModal(true)}
          >
            Use Mapbox Token
          </Button>
        )}
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={containerRef} 
          className="w-full h-[70vh] rounded-xl overflow-hidden shadow-lg border border-border"
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="text-muted-foreground">Loading map data...</div>
          </div>
        )}
      </div>

      {/* Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-xl border border-border w-[420px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif font-semibold text-lg">Mapbox Token (Optional)</h3>
              <Button size="sm" variant="ghost" onClick={() => setShowTokenModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a public token to use Mapbox styles and terrain. Otherwise we'll use the free demo style.
            </p>
            <TokenForm
              onSave={(t) => {
                localStorage.setItem('MAPBOX_TOKEN', t);
                setToken(t);
                setShowTokenModal(false);
              }}
              onClose={() => setShowTokenModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* Helper Components */

function Toggle({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked: boolean; 
  onChange: () => void; 
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-ocean border-border rounded focus:ring-ocean focus:ring-2"
      />
      <span className="text-foreground">{label}</span>
    </label>
  );
}

function TokenForm({ 
  onSave, 
  onClose 
}: { 
  onSave: (token: string) => void; 
  onClose: () => void; 
}) {
  const [val, setVal] = useState('');
  
  return (
    <div>
      <input
        className="w-full border border-border rounded px-3 py-2 mb-4 bg-background text-foreground"
        placeholder="pk.eyJ1..."
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => val && onSave(val)}
          disabled={!val}
        >
          Save Token
        </Button>
      </div>
    </div>
  );
}

/* Helper Functions */

function setLayerVisibility(map: Map, kind: 'ports' | 'monsoon' | 'routes', show: boolean) {
  const layerIds = kind === 'ports'
    ? ['ports-clusters', 'ports-cluster-count', 'ports-unclustered']
    : kind === 'monsoon' 
    ? ['monsoon-lines'] 
    : ['routes-lines'];
  
  console.log(`Setting ${kind} visibility to ${show}`, layerIds);
    
  layerIds.forEach(id => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'visibility', show ? 'visible' : 'none');
      console.log(`Layer ${id} visibility set to ${show ? 'visible' : 'none'}`);
    } else {
      console.warn(`Layer ${id} not found on map`);
    }
  });
}