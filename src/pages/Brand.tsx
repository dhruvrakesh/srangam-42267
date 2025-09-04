import { Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';

export default function Brand() {
  const assets = [
    {
      name: 'Srangam Mark (Full)',
      file: 'srangam_mark.svg',
      description: 'Primary symbol with strata lines',
      size: 'Vector SVG'
    },
    {
      name: 'Srangam Mark (Simple)',
      file: 'srangam_mark_simple.svg',
      description: 'Simplified symbol for small sizes',
      size: 'Vector SVG'
    },
    {
      name: 'Horizontal Lockup',
      file: 'srangam_logo_horizontal.svg',
      description: 'Logo with text for headers',
      size: 'Vector SVG'
    },
    {
      name: 'Favicon (ICO)',
      file: 'srangam_favicon.ico',
      description: 'Windows/legacy favicon',
      size: '16×16, 32×32, 48×48'
    },
    {
      name: 'Favicon (512px)',
      file: 'srangam_favicon_512.png',
      description: 'High-resolution PNG favicon',
      size: '512×512 PNG'
    },
    {
      name: 'Favicon (192px)',
      file: 'srangam_favicon_192.png',
      description: 'Standard PNG favicon',
      size: '192×192 PNG'
    },
    {
      name: 'Apple Touch Icon',
      file: 'srangam_favicon_180.png',
      description: 'iOS home screen icon',
      size: '180×180 PNG'
    },
    {
      name: 'PWA Manifest',
      file: 'site.webmanifest',
      description: 'Progressive Web App manifest',
      size: 'JSON'
    }
  ];

  const brandColors = [
    { name: 'Ocean Teal', hex: '#2A9D8F', css: '--ocean-teal', usage: 'Primary brand color, water themes' },
    { name: 'Epigraphy Maroon', hex: '#7B2D26', css: '--epigraphy-maroon', usage: 'Text, inscriptions, heritage' },
    { name: 'Ink', hex: '#111111', css: '--ink', usage: 'Deep text, high contrast' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            Srangam Brand Assets
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Download and use Srangam's visual identity assets. Please maintain proper spacing 
            and minimum sizes for optimal brand representation.
          </p>
        </div>

        {/* Logo Showcase */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-8">Logo Variants</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Light Background */}
            <Card>
              <CardHeader>
                <CardTitle>Light Background</CardTitle>
                <CardDescription>Primary usage on light surfaces</CardDescription>
              </CardHeader>
              <CardContent className="bg-white p-8 rounded-md">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <Logo variant="symbol" size={80} />
                  </div>
                  <div className="flex items-center justify-center">
                    <Logo variant="lockup" size={60} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dark Background */}
            <Card>
              <CardHeader>
                <CardTitle>Dark Background</CardTitle>
                <CardDescription>Usage on dark surfaces</CardDescription>
              </CardHeader>
              <CardContent className="bg-slate-900 p-8 rounded-md">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <Logo variant="symbol" size={80} />
                  </div>
                  <div className="flex items-center justify-center">
                    <Logo variant="lockup" size={60} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-8">Brand Colors</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {brandColors.map((color) => (
              <Card key={color.name}>
                <CardHeader>
                  <div 
                    className="w-full h-24 rounded-md mb-4"
                    style={{ backgroundColor: color.hex }}
                  />
                  <CardTitle className="text-lg">{color.name}</CardTitle>
                  <CardDescription>{color.usage}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>HEX:</strong> {color.hex}</div>
                    <div><strong>CSS:</strong> {color.css}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-8">Usage Guidelines</h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Minimum Sizes</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Symbol mark: 16px minimum</li>
                    <li>• Horizontal lockup: 120px width minimum</li>
                    <li>• Maintain aspect ratios at all sizes</li>
                    <li>• Use simple mark below 80px</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Clear Space</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Minimum clear space equals height of mark</li>
                    <li>• Keep other elements outside this zone</li>
                    <li>• Ensure sufficient contrast on backgrounds</li>
                    <li>• Avoid overlaying on busy imagery</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Assets */}
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-8">Download Assets</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <Card key={asset.file}>
                <CardHeader>
                  <CardTitle className="text-lg">{asset.name}</CardTitle>
                  <CardDescription>{asset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{asset.size}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/brand/${asset.file}`, '_blank')}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `/brand/${asset.file}`;
                          link.download = asset.file;
                          link.click();
                        }}
                      >
                        <Download size={16} className="mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-16 text-center">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Questions about brand usage?
              </h3>
              <p className="text-muted-foreground mb-6">
                For licensing, partnerships, or other brand inquiries, please get in touch.
              </p>
              <Button variant="outline">
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}