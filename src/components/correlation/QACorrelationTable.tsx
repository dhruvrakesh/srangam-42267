import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

interface CorrelationData {
  id: number;
  page_or_card: string;
  claim: string;
  evidence_primary: string;
  evidence_archaeology: string;
  pin_place: string;
  lat: number;
  lon: number;
  suggested_article: string;
  mla_primary: string;
}

interface QACorrelationTableProps {
  pageFilter?: string;
  compact?: boolean;
}

const CATEGORIES = [
  'Ports & Emporia',
  'Transoceanic Hubs', 
  'Red Sea Gateways',
  'Arabian Littoral',
  'Horn of Africa',
  'Western Indian Ocean',
  'Governance & Edicts',
  'Court & Diplomacy',
  'Coin Hoards',
  'Forts & Naval',
  'Waypoints',
  'Interior Corridors',
  'Epigraphy & Guilds',
  'Ritual Memory'
];

export const QACorrelationTable: React.FC<QACorrelationTableProps> = ({
  pageFilter,
  compact = false
}) => {
  const { t } = useTranslation();
  const [data, setData] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [confidenceFilter, setConfidenceFilter] = useState<string[]>(['high', 'medium', 'approximate']);

  useEffect(() => {
    const loadCorrelationData = async () => {
      try {
        const response = await fetch('/data/correlation_matrix_oceanic_bharat_EXPANDED.csv');
        const csvText = await response.text();
        
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const parsedData: CorrelationData[] = lines.slice(1).map((line, index) => {
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          return {
            id: index + 1,
            page_or_card: values[0] || '',
            claim: values[1] || '',
            evidence_primary: values[2] || '',
            evidence_archaeology: values[3] || '',
            pin_place: values[4] || '',
            lat: parseFloat(values[5]) || 0,
            lon: parseFloat(values[6]) || 0,
            suggested_article: values[7] || '',
            mla_primary: values[8] || ''
          };
        });

        setData(parsedData);
        
        if (pageFilter) {
          setSearchTerm(pageFilter);
        }
      } catch (error) {
        console.error('Failed to load correlation data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCorrelationData();
  }, [pageFilter]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesSearch = searchTerm === '' || 
        Object.values(row).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(row.page_or_card);

      const hasPairedEvidence = row.evidence_primary.trim() !== '' && 
        row.evidence_archaeology.trim() !== '';
      
      const confidence = hasPairedEvidence ? 'high' : 
        (row.evidence_primary.trim() !== '' || row.evidence_archaeology.trim() !== '') ? 'medium' : 'approximate';
      
      const matchesConfidence = confidenceFilter.includes(confidence);

      return matchesSearch && matchesCategory && matchesConfidence;
    });
  }, [data, searchTerm, selectedCategories, confidenceFilter]);

  const getConfidence = (row: CorrelationData): 'high' | 'medium' | 'approximate' => {
    const hasPrimary = row.evidence_primary.trim() !== '';
    const hasArchaeology = row.evidence_archaeology.trim() !== '';
    
    if (hasPrimary && hasArchaeology) return 'high';
    if (hasPrimary || hasArchaeology) return 'medium';
    return 'approximate';
  };

  const getPairedEvidenceViolations = () => {
    return data.filter(row => {
      const hasPrimary = row.evidence_primary.trim() !== '';
      const hasArchaeology = row.evidence_archaeology.trim() !== '';
      return !(hasPrimary && hasArchaeology);
    }).length;
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Category', 'Claim', 'Primary Evidence', 'Archaeological Evidence', 'Location', 'Lat', 'Lon', 'Article', 'Citation', 'Confidence'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.id,
        `"${row.page_or_card}"`,
        `"${row.claim}"`,
        `"${row.evidence_primary}"`,
        `"${row.evidence_archaeology}"`,
        `"${row.pin_place}"`,
        row.lat,
        row.lon,
        `"${row.suggested_article}"`,
        `"${row.mla_primary}"`,
        getConfidence(row)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srangam-correlation-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const exportData = {
      metadata: {
        exported: new Date().toISOString(),
        total_rows: filteredData.length,
        filters: {
          search: searchTerm,
          categories: selectedCategories,
          confidence: confidenceFilter
        }
      },
      data: filteredData.map(row => ({
        ...row,
        confidence: getConfidence(row),
        has_paired_evidence: getConfidence(row) === 'high'
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srangam-correlation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading correlation data...</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Quality Assurance Matrix</CardTitle>
            <Badge variant="secondary">{filteredData.length} entries</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExportCSV}>
                <Download className="h-3 w-3 mr-1" />
                CSV
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportJSON}>
                <Download className="h-3 w-3 mr-1" />
                JSON
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-green-600">High Confidence</div>
                <div className="text-muted-foreground">
                  {filteredData.filter(row => getConfidence(row) === 'high').length}
                </div>
              </div>
              <div>
                <div className="font-medium text-yellow-600">Medium Confidence</div>
                <div className="text-muted-foreground">
                  {filteredData.filter(row => getConfidence(row) === 'medium').length}
                </div>
              </div>
              <div>
                <div className="font-medium text-orange-600">Approximate</div>
                <div className="text-muted-foreground">
                  {filteredData.filter(row => getConfidence(row) === 'approximate').length}
                </div>
              </div>
            </div>

            {getPairedEvidenceViolations() > 0 && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-700">
                  {getPairedEvidenceViolations()} entries lack paired evidence
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">QA Correlation Table</h2>
          <p className="text-muted-foreground">
            Transparency matrix for {data.length} research correlations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search claims, evidence, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {['high', 'medium', 'approximate'].map(conf => (
                <Button
                  key={conf}
                  size="sm"
                  variant={confidenceFilter.includes(conf) ? 'default' : 'outline'}
                  onClick={() => {
                    setConfidenceFilter(prev => 
                      prev.includes(conf) 
                        ? prev.filter(c => c !== conf)
                        : [...prev, conf]
                    );
                  }}
                  className="capitalize"
                >
                  {conf}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.slice(0, 8).map(category => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedCategories(prev => 
                    prev.includes(category)
                      ? prev.filter(c => c !== category)
                      : [...prev, category]
                  );
                }}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredData.filter(row => getConfidence(row) === 'high').length}
            </div>
            <div className="text-sm text-muted-foreground">High Confidence</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredData.filter(row => getConfidence(row) === 'medium').length}
            </div>
            <div className="text-sm text-muted-foreground">Medium Confidence</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {filteredData.filter(row => getConfidence(row) === 'approximate').length}
            </div>
            <div className="text-sm text-muted-foreground">Approximate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <div className="text-sm text-muted-foreground">Total Entries</div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Badge */}
      {getPairedEvidenceViolations() === 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-medium text-green-700">Paired Evidence Standard Met</span>
          <span className="text-sm text-green-600">All entries have supporting primary and archaeological evidence</span>
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="max-w-xs">Claim</TableHead>
                <TableHead>Primary Evidence</TableHead>
                <TableHead>Archaeological Evidence</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => {
                const confidence = getConfidence(row);
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm">{row.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {row.page_or_card}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm line-clamp-3">{row.claim}</div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {row.evidence_primary || '—'}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {row.evidence_archaeology || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{row.pin_place}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.lat.toFixed(2)}, {row.lon.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={confidence === 'high' ? 'default' : 'secondary'}
                        className={
                          confidence === 'high' ? 'bg-green-100 text-green-800' :
                          confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }
                      >
                        {confidence}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/atlas?id=${row.pin_place.toLowerCase().replace(/\s+/g, '_')}&lat=${row.lat}&lon=${row.lon}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};