// Modular Indian Ocean World Components
export { Sourcebook } from './Sourcebook';
export { RouteAtlas } from './RouteAtlas';
export { RitualCalendar } from './RitualCalendar';
export { MaritimeLexicon } from './MaritimeLexicon';
export { ObjectGallery } from './ObjectGallery';
export { ScholarlySourcePanel } from './ScholarlySourcePanel';
export { TimelineNodeDetails } from './TimelineNodeDetails';

// Data processing utilities
export const parseSourcebookCSV = (csvText: string) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',');
    const entry: any = {};
    
    headers.forEach((header, index) => {
      entry[header.trim()] = values[index]?.trim() || '';
    });
    
    // Parse coordinates
    if (entry.lat && entry.lon) {
      entry.lat = parseFloat(entry.lat);
      entry.lon = parseFloat(entry.lon);
    }
    
    return entry;
  });
};

export const parseGeoJSON = (geoJsonData: any) => {
  return geoJsonData.features || [];
};