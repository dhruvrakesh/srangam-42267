import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconScript, IconLotus } from '@/components/icons';
import { ArrowRight, Github } from 'lucide-react';

const tools = [
  {
    path: '/sanskrit-translator',
    icon: IconScript,
    title: 'Sanskrit Translation & Analysis',
    badge: 'Python • Open Source',
    items: [
      'Sandhi splitting with Pāṇinian grammar',
      'Morphological parsing & root analysis',
      'Named-entity recognition',
      'Evidence-based translation with citations'
    ],
    description:
      'Upload or paste classical texts and receive detailed, explainable translations powered by Pāṇinian grammar, modern AI, and a growing database of tribes, clans, and places.',
    color: 'indigo-dharma'
  },
  {
    path: '/jyotish-horoscope',
    icon: IconLotus,
    title: 'Jyotiṣa Panchang & Horoscope',
    badge: 'Python • Open Source',
    items: [
      'Swiss Ephemeris precision (0.001″)',
      'D1/D9 North Indian charts',
      'Vimśottarī Daśā timelines',
      'Multiple Ayanāṃśa systems'
    ],
    description:
      'Calculate your sidereal birth chart with precise planetary positions, rāśis, houses, and Daśā timelines using Swiss Ephemeris and classical Vedic methods.',
    color: 'peacock-blue'
  }
];

const ToolsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-turmeric/5 relative">
      <div className="absolute inset-0 chakra-pattern opacity-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Github size={48} className="text-turmeric animate-pulse-gentle" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Research Tools: Sanskrit & Jyotiṣa
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our open-source computational tools for Sanskrit linguistics and Vedic astrology, 
            grounded in classical scholarship and modern astronomical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tools.map(({ path, icon: Icon, title, badge, items, description, color }) => (
            <Link
              key={path}
              to={path}
              className="group block p-8 bg-card rounded-lg border border-border hover:shadow-xl transition-all duration-300 hover:border-saffron/50 relative overflow-hidden animate-fade-in"
            >
              <div className="absolute inset-0 manuscript-texture opacity-20" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-${color} animate-pulse-gentle`}>
                    <Icon size={40} />
                  </div>
                  <span className="px-3 py-1 bg-saffron/10 text-saffron text-xs font-medium rounded-full border border-saffron/20">
                    {badge}
                  </span>
                </div>
                
                <h3 className="font-serif text-2xl font-bold text-foreground group-hover:text-saffron transition-colors mb-4">
                  {title}
                </h3>
                
                <ul className="space-y-2 mb-4">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-start text-sm text-muted-foreground">
                      <span className="text-peacock-blue mr-2 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-saffron font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                    Explore Tool <ArrowRight size={16} />
                  </span>
                  <Github size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
