import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconOm } from '@/components/icons/IconOm';
import { continuousHabitationUttarapatha } from '@/data/articles/continuous-habitation-uttarapatha';
import { Helmet } from 'react-helmet-async';

export default function ContinuousHabitationUttarapatha() {
  const contentForNarration = typeof continuousHabitationUttarapatha.content === 'object' 
    ? (continuousHabitationUttarapatha.content.en as string || '')
    : continuousHabitationUttarapatha.content;

  return (
    <>
      <Helmet>
        <title>Where Civilization Never Slept: Continuous Habitation Along the Uttarapatha | Srangam</title>
        <meta 
          name="description" 
          content="A comprehensive study of urban continuity in South Asia, examining how ancient cities along the Uttarapatha maintained unbroken chains of settlement, knowledge transmission, and cultural memory from the Bronze Age to the present." 
        />
        <meta property="og:title" content="Continuous Habitation Along the Uttarapatha" />
        <meta property="og:description" content="Urban continuity and cultural transmission in ancient South Asia" />
        <meta property="og:type" content="article" />
        <meta property="article:author" content="NF Research Team" />
        <meta property="article:published_time" content="2025-01-15" />
      </Helmet>
      <ArticlePage
        title={continuousHabitationUttarapatha.title}
        dek={continuousHabitationUttarapatha.dek}
        content={continuousHabitationUttarapatha.content}
        tags={continuousHabitationUttarapatha.tags}
        icon={IconOm}
        author="NF Research Team"
        date="2025-01-15"
        readTime={55}
      />
    </>
  );
}
