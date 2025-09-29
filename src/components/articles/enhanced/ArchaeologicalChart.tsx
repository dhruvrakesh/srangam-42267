import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ArchaeologicalChartProps {
  title?: string;
  className?: string;
}

export const ArchaeologicalChart: React.FC<ArchaeologicalChartProps> = ({ 
  title = "Archaeological Nexus: Comparing Cultural Markers",
  className = ""
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create new chart
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Urban Planning',
          'Ring Wells', 
          'Advanced Metallurgy',
          'Literacy (Script)',
          'Maritime Trade'
        ],
        datasets: [
          {
            label: 'Sindhu-Saraswati',
            data: [95, 20, 70, 90, 85],
            backgroundColor: 'hsl(25, 95%, 53%)', // saffron
            borderColor: 'hsl(25, 95%, 43%)',
            borderWidth: 2,
            borderRadius: 4
          },
          {
            label: 'Ganga-Vindhya',
            data: [60, 80, 85, 50, 40], 
            backgroundColor: 'hsl(344, 73%, 32%)', // burgundy-light
            borderColor: 'hsl(344, 73%, 22%)',
            borderWidth: 2,
            borderRadius: 4
          },
          {
            label: 'Keezhadi / Vaigai',
            data: [75, 90, 95, 98, 90],
            backgroundColor: 'hsl(42, 78%, 58%)', // gold-warm
            borderColor: 'hsl(42, 78%, 48%)',
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Prevalence of Cultural Markers Across Civilizations',
            font: {
              size: 16,
              family: 'Inter, sans-serif',
              weight: 'bold'
            },
            color: 'hsl(218, 15%, 12%)' // charcoal
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                family: 'Inter, sans-serif'
              },
              color: 'hsl(218, 15%, 12%)'
            }
          },
          tooltip: {
            backgroundColor: 'hsl(0, 0%, 100%)',
            titleColor: 'hsl(218, 15%, 12%)',
            bodyColor: 'hsl(218, 15%, 12%)',
            borderColor: 'hsl(35, 15%, 82%)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw}% prevalence`;
              },
              afterLabel: function(context) {
                const explanations = {
                  'Urban Planning': 'Organized street layouts, drainage systems, standardized construction',
                  'Ring Wells': 'Sophisticated water management with terracotta ring structures',
                  'Advanced Metallurgy': 'Iron, steel, bronze working; specialized alloys and techniques',
                  'Literacy (Script)': 'Evidence of writing systems and widespread literacy',
                  'Maritime Trade': 'Port infrastructure, international trade connections'
                };
                return explanations[context.label as keyof typeof explanations] || '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Prevalence / Advancement Index (%)',
              font: {
                size: 12,
                family: 'Inter, sans-serif',
                weight: 'normal'
              },
              color: 'hsl(218, 15%, 12%)'
            },
            ticks: {
              color: 'hsl(218, 15%, 12%)',
              font: {
                family: 'Inter, sans-serif'
              }
            },
            grid: {
              color: 'hsl(35, 15%, 82%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Cultural Markers',
              font: {
                size: 12,
                family: 'Inter, sans-serif',
                weight: 'normal'
              },
              color: 'hsl(218, 15%, 12%)'
            },
            ticks: {
              color: 'hsl(218, 15%, 12%)',
              font: {
                family: 'Inter, sans-serif',
                size: 11
              },
              maxRotation: 45
            },
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className={`py-16 ${className}`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Physical evidence from excavations across India reveals shared urban planning principles, 
            water management systems, and technological advancements. This comparative analysis illustrates 
            a shared technological substrate connecting diverse regions.
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-foreground/80 text-sm font-medium">
              Comparative Analysis: Archaeological Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative w-full h-96 md:h-[450px]">
              <canvas ref={chartRef}></canvas>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
                <strong>Methodology:</strong> Index values represent relative prevalence and sophistication 
                of each cultural marker based on archaeological evidence. Sindhu-Saraswati shows exceptional 
                urban planning, Ganga-Vindhya excels in ring well technology, while Keezhadi demonstrates 
                remarkable literacy and metallurgical advancement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};