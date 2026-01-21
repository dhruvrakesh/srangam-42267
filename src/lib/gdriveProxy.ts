/**
 * Google Drive Image Proxy Utility
 * 
 * Converts Google Drive share URLs to proxied URLs that bypass CORS restrictions.
 * Used for OG images stored on Google Drive.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Extract file ID from various Google Drive URL formats
 */
function extractGDriveFileId(url: string): string | null {
  if (!url) return null;
  
  // Format: https://drive.google.com/uc?export=view&id=FILE_ID
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return ucMatch[1];
  
  // Format: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  
  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return openMatch[1];
  
  return null;
}

/**
 * Check if URL is a Google Drive URL
 */
export function isGDriveUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('drive.google.com');
}

/**
 * Convert a Google Drive URL to a proxied URL
 * 
 * @param ogImageUrl - The original og_image_url from the database
 * @returns Proxied URL or original URL if not a GDrive URL
 */
export function getProxiedImageUrl(ogImageUrl: string | null | undefined): string {
  if (!ogImageUrl) return '';
  
  // Only proxy Google Drive URLs
  if (!isGDriveUrl(ogImageUrl)) {
    return ogImageUrl;
  }
  
  const fileId = extractGDriveFileId(ogImageUrl);
  if (!fileId) {
    console.warn('[gdriveProxy] Could not extract file ID from:', ogImageUrl);
    return ogImageUrl;  // Fallback to original
  }
  
  return `${SUPABASE_URL}/functions/v1/gdrive-image-proxy?id=${fileId}`;
}

/**
 * Get direct GDrive file ID for debugging
 */
export function getGDriveFileId(url: string | null | undefined): string | null {
  if (!url) return null;
  return extractGDriveFileId(url);
}
