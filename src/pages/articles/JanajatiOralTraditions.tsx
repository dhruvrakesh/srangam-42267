import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { janajatiOralTraditions } from '@/data/articles/janajati-oral-traditions';
import { IconLotus } from '@/components/icons';

export default function JanajatiOralTraditions() {
  return (
    <ArticlePage
      title={janajatiOralTraditions.title}
      dek={janajatiOralTraditions.dek}
      content={janajatiOralTraditions.content}
      tags={janajatiOralTraditions.tags}
      icon={IconLotus}
      readTime={42}
      author="Nartiang Foundation Research Team"
      date="2025-10-05"
    />
  );
}
