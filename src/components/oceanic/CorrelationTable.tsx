import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { correlationEngine } from '@/lib/correlationEngine';
import { Download, Search, Filter } from 'lucide-react';

export const CorrelationTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Get all correlation data
  const allData = correlationEngine.getAllCorrelationData();
  
  // Filter data based on search and category
  const filteredData = allData.filter(item => {
    const matchesSearch = !searchTerm || 
      item.claim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pin_place.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.evidence_primary.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      item.page_or_card.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });
  
  const categories = [
    'all', 'Ports & Emporia', 'Transoceanic Hubs', 'Epigraphy & Guilds',
    'Governance & Edicts', 'Coin Hoards', 'Forts & Naval', 'Waypoints'
  ];
  
  const downloadCSV = () => {
    const headers = ['Category', 'Claim', 'Primary Evidence', 'Archaeological Evidence', 'Pin Place', 'Lat', 'Lon', 'Suggested Article', 'MLA Citation'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        `"${item.page_or_card}"`,
        `"${item.claim}"`,
        `"${item.evidence_primary}"`,
        `"${item.evidence_archaeology}"`,
        `"${item.pin_place}"`,
        item.lat,
        item.lon,
        `"${item.suggested_article}"`,
        `"${item.mla_primary}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oceanic-bharat-correlation-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Correlation Matrix QA Table
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredData.length} of {allData.length} correlation points displayed
            </p>
          </div>
          <Button onClick={downloadCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims, places, or evidence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="min-w-[300px]">Claim</TableHead>
                <TableHead className="min-w-[200px]">Primary Evidence</TableHead>
                <TableHead className="min-w-[200px]">Archaeological Evidence</TableHead>
                <TableHead className="min-w-[200px]">Pin Place</TableHead>
                <TableHead className="w-[80px]">Coords</TableHead>
                <TableHead className="min-w-[180px]">Suggested Article</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {item.page_or_card}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.claim}
                    {item.confidence === 'low' && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Approx.
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.evidence_primary === '—' ? (
                      <span className="text-muted-foreground italic">Archaeological only</span>
                    ) : (
                      item.evidence_primary
                    )}
                  </TableCell>
                  <TableCell>
                    {item.evidence_archaeology === '—' ? (
                      <span className="text-muted-foreground italic">Textual only</span>
                    ) : (
                      item.evidence_archaeology
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.pin_place}</div>
                    {item.pin_place.includes('[approx.]') && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Approximate
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {parseFloat(item.lat).toFixed(2)}, {parseFloat(item.lon).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{item.suggested_article}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.mla_primary.split('.')[0]}...
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No correlation points match your current filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};