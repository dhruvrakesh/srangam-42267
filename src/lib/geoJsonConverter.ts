// GeoJSON Data Converter for Cosmic Ocean
import portsData from '@/data/cosmic_ocean/ports.json';
import monsoonData from '@/data/cosmic_ocean/monsoon.json';
import layersData from '@/data/cosmic_ocean/layers.json';

export interface PortProperties {
  id: string;
  name: string;
  region: string;
  period_band: string;
  evidence_types: string;
  tags: string;
  description?: string;
  needs_citation?: boolean;
}

export interface MonsoonProperties {
  id: string;
  season: string;
  title_en: string;
  title_hi: string;
  months: string;
  narrative_en: string;
  narrative_hi: string;
}

export interface RouteProperties {
  id: string;
  from: string;
  to: string;
  period_band: string;
  note: string;
  needs_citation: boolean;
}

// Convert ports data to GeoJSON
export function convertPortsToGeoJSON() {
  const features = portsData.ports.map(port => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [port.coords.lon, port.coords.lat]
    },
    properties: {
      id: port.id,
      name: port.display_name,
      region: port.region,
      period_band: port.period_band,
      evidence_types: port.evidence_types.join(', '),
      tags: port.tags.join(', '),
      description: port.description,
      needs_citation: port.needs_citation
    } as PortProperties
  }));

  return {
    type: 'FeatureCollection' as const,
    features
  };
}

// Convert monsoon data to GeoJSON LineStrings
export function convertMonsoonToGeoJSON() {
  const features = monsoonData.seasons.flatMap(season => 
    season.vectors.map((vector, index) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [vector.from, vector.to]
      },
      properties: {
        id: `${season.id}-${index}`,
        season: season.id,
        title_en: season.title_en,
        title_hi: season.title_hi,
        months: season.months.join(', '),
        narrative_en: season.narrative_en,
        narrative_hi: season.narrative_hi,
        label: vector.label,
        sector: vector.sector
      } as MonsoonProperties & { label: string; sector: string }
    }))
  );

  return {
    type: 'FeatureCollection' as const,
    features
  };
}

// Convert schematic routes to GeoJSON
export function convertRoutesToGeoJSON() {
  // Create a port lookup for coordinates
  const portLookup = portsData.ports.reduce((acc, port) => {
    acc[port.id] = [port.coords.lon, port.coords.lat];
    return acc;
  }, {} as Record<string, [number, number]>);

  const features = layersData.map.routes.map((route, index) => {
    const fromCoords = portLookup[route.from];
    const toCoords = portLookup[route.to];
    
    if (!fromCoords || !toCoords) {
      console.warn(`Missing coordinates for route: ${route.from} -> ${route.to}`);
      return null;
    }

    // Create a great circle route for better visualization
    const coordinates = createGreatCircleRoute(fromCoords, toCoords);

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates
      },
      properties: {
        id: `route-${index}`,
        from: route.from,
        to: route.to,
        period_band: route.period_band,
        note: route.note,
        needs_citation: route.needs_citation
      } as RouteProperties
    };
  }).filter(Boolean);

  return {
    type: 'FeatureCollection' as const,
    features: features.filter((f): f is NonNullable<typeof f> => f !== null)
  };
}

// Create a simple great circle route approximation
function createGreatCircleRoute(
  from: [number, number], 
  to: [number, number], 
  segments: number = 20
): [number, number][] {
  const [fromLon, fromLat] = from;
  const [toLon, toLat] = to;
  
  const coordinates: [number, number][] = [];
  
  for (let i = 0; i <= segments; i++) {
    const fraction = i / segments;
    
    // Simple linear interpolation for now (can be enhanced with proper great circle math)
    const lon = fromLon + (toLon - fromLon) * fraction;
    const lat = fromLat + (toLat - fromLat) * fraction;
    
    coordinates.push([lon, lat]);
  }
  
  return coordinates;
}

// Generate all GeoJSON files
export async function generateGeoJSONFiles() {
  const portsGeoJSON = convertPortsToGeoJSON();
  const monsoonGeoJSON = convertMonsoonToGeoJSON();
  const routesGeoJSON = convertRoutesToGeoJSON();

  return {
    ports: portsGeoJSON,
    monsoon: monsoonGeoJSON,
    routes: routesGeoJSON
  };
}

// Export individual converters
export const geoJsonConverters = {
  ports: convertPortsToGeoJSON,
  monsoon: convertMonsoonToGeoJSON,
  routes: convertRoutesToGeoJSON
};