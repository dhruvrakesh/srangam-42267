import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { TagChip } from '@/components/ui/TagChip';
import { cn } from '@/lib/utils';

interface ArticlePageProps {
  title: string;
  dek: string;
  content: string;
  tags: string[];
  icon: React.ComponentType<{ className?: string; size?: number }>;
  readTime?: number;
  author?: string;
  date?: string;
  dataComponents?: React.ReactNode[];
}

export function ArticlePage({
  title,
  dek,
  content,
  tags,
  icon: Icon,
  readTime = 8,
  author,
  date,
  dataComponents = []
}: ArticlePageProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link 
          to="/" 
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Home
        </Link>
      </nav>

      {/* Article Header */}
      <header className="mb-12 text-center">
        <div className="flex justify-center mb-6">
          <Icon className="text-ocean" size={64} />
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          {title}
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
          {dek}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {tags.map((tag) => (
            <TagChip key={tag} variant="theme">
              {tag}
            </TagChip>
          ))}
        </div>

        {/* Meta */}
        <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
          <span>{readTime} min read</span>
          {author && (
            <>
              <span>•</span>
              <span>{author}</span>
            </>
          )}
          {date && (
            <>
              <span>•</span>
              <span>{date}</span>
            </>
          )}
        </div>
      </header>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <h2 className="font-serif text-2xl font-bold text-foreground mt-12 mb-6">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-serif text-xl font-semibold text-foreground mt-8 mb-4">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-foreground leading-relaxed mb-6">
                {children}
              </p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-ocean pl-6 my-8 italic text-muted-foreground bg-sand/20 py-4">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="text-foreground leading-relaxed">
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>

        {/* Data Components */}
        {dataComponents.length > 0 && (
          <div className="mt-12 space-y-8">
            {dataComponents.map((component, index) => (
              <div key={index} className="bg-sand/10 p-6 rounded-lg">
                {component}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}