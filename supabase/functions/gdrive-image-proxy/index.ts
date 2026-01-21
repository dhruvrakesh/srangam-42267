import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Google Drive Image Proxy
 * 
 * Proxies Google Drive images to bypass CORS restrictions for OG images.
 * Returns the image with proper CORS headers and caching.
 * 
 * Usage: /functions/v1/gdrive-image-proxy?id=FILE_ID
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const fileId = url.searchParams.get('id');
    
    if (!fileId) {
      console.error('[gdrive-image-proxy] Missing file ID');
      return new Response('Missing file ID', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log(`[gdrive-image-proxy] Fetching file: ${fileId}`);

    // Fetch from Google Drive using the direct export URL
    const gdriveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    const response = await fetch(gdriveUrl, {
      redirect: 'follow',  // Follow Google's redirects
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Srangam/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`[gdrive-image-proxy] GDrive error: ${response.status} ${response.statusText}`);
      return new Response('Image not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    console.log(`[gdrive-image-proxy] Success: ${fileId}, ${imageBuffer.byteLength} bytes, ${contentType}`);

    return new Response(imageBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',  // 24h cache, 7d stale
        'X-Content-Type-Options': 'nosniff',
      }
    });
  } catch (error) {
    console.error('[gdrive-image-proxy] Error:', error);
    return new Response('Proxy error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
