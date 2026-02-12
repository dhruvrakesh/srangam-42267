import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Use the actual published URL
    const baseUrl = 'https://srangam.nartiang.org';
    const urls: SitemapUrl[] = [];

    // Static routes with SEO priorities
    const staticRoutes: SitemapUrl[] = [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/articles', priority: 0.9, changefreq: 'daily' },
      { loc: '/begin-journey', priority: 0.9, changefreq: 'weekly' },
      { loc: '/about', priority: 0.8, changefreq: 'monthly' },
      { loc: '/maps-data', priority: 0.7, changefreq: 'weekly' },
      { loc: '/research-network', priority: 0.7, changefreq: 'weekly' },
      { loc: '/data-viz', priority: 0.7, changefreq: 'weekly' },
      { loc: '/field-notes', priority: 0.6, changefreq: 'monthly' },
      { loc: '/reading-room', priority: 0.8, changefreq: 'weekly' },
      { loc: '/sources-method', priority: 0.7, changefreq: 'monthly' },
      { loc: '/sitemap', priority: 0.5, changefreq: 'monthly' },
      { loc: '/sources/epigraphy', priority: 0.7, changefreq: 'monthly' },
      { loc: '/sources/edicts', priority: 0.7, changefreq: 'monthly' },
      { loc: '/sources/sanskrit-terminology', priority: 0.7, changefreq: 'monthly' },
      { loc: '/sanskrit-translator', priority: 0.6, changefreq: 'monthly' },
      { loc: '/jyotish-horoscope', priority: 0.6, changefreq: 'monthly' },
    ];

    urls.push(...staticRoutes);

    // Theme pages
    const themeRoutes = [
      '/themes/ancient-india',
      '/themes/indian-ocean-world',
      '/themes/scripts-inscriptions',
      '/themes/geology-deep-time',
      '/themes/empires-exchange',
    ];

    themeRoutes.forEach(route => {
      urls.push({
        loc: route,
        priority: 0.8,
        changefreq: 'weekly',
      });
    });

    // Fetch database articles - prefer slug_alias over slug
    const { data: dbArticles, error: dbError } = await supabase
      .from('srangam_articles')
      .select('slug, slug_alias, updated_at, published_date')
      .eq('status', 'published')
      .order('published_date', { ascending: false });

    if (dbError) {
      console.error('Database articles fetch error:', dbError);
    }

    // Add database articles - use slug_alias if available
    if (dbArticles) {
      dbArticles.forEach(article => {
        const articleSlug = article.slug_alias || article.slug;
        urls.push({
          loc: `/articles/${articleSlug}`,
          lastmod: article.updated_at || article.published_date,
          priority: 0.9,
          changefreq: 'monthly',
        });
      });
    }

    console.log(`Generated sitemap with ${urls.length} URLs for ${baseUrl}`);

    // Generate XML sitemap
    const xml = generateSitemapXML(baseUrl, urls);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateSitemapXML(baseUrl: string, urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => {
    const lastmod = url.lastmod 
      ? `\n    <lastmod>${new Date(url.lastmod).toISOString().split('T')[0]}</lastmod>` 
      : '';
    return `  <url>
    <loc>${baseUrl}${url.loc}</loc>${lastmod}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
