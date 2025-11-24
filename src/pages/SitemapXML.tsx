import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SitemapXML: React.FC = () => {
  const [xml, setXml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-sitemap');
        
        if (error) {
          console.error('Sitemap fetch error:', error);
          setXml('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
        } else {
          setXml(data);
        }
      } catch (err) {
        console.error('Sitemap generation failed:', err);
        setXml('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      } finally {
        setLoading(false);
      }
    };

    fetchSitemap();
  }, []);

  useEffect(() => {
    if (!loading && xml) {
      // Set content type to XML
      document.documentElement.setAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
    }
  }, [loading, xml]);

  if (loading) {
    return (
      <div style={{ fontFamily: 'monospace', padding: '20px' }}>
        Generating sitemap...
      </div>
    );
  }

  return (
    <pre style={{ 
      fontFamily: 'monospace', 
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      margin: 0,
      padding: '20px'
    }}>
      {xml}
    </pre>
  );
};

export default SitemapXML;
