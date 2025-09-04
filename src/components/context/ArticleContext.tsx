import React, { createContext, useContext, useReducer, useCallback } from 'react';

interface ArticleState {
  readingProgress: number;
  currentSection: string;
  expandedSections: Set<string>;
  bookmarks: Set<string>;
  annotations: Map<string, string>;
  readingMode: 'normal' | 'focus' | 'accessible';
  theme: 'light' | 'dark' | 'auto';
}

type ArticleAction = 
  | { type: 'SET_READING_PROGRESS'; payload: number }
  | { type: 'SET_CURRENT_SECTION'; payload: string }
  | { type: 'TOGGLE_SECTION'; payload: string }
  | { type: 'TOGGLE_BOOKMARK'; payload: string }
  | { type: 'ADD_ANNOTATION'; payload: { id: string; text: string } }
  | { type: 'REMOVE_ANNOTATION'; payload: string }
  | { type: 'SET_READING_MODE'; payload: ArticleState['readingMode'] }
  | { type: 'SET_THEME'; payload: ArticleState['theme'] };

const initialState: ArticleState = {
  readingProgress: 0,
  currentSection: '',
  expandedSections: new Set(),
  bookmarks: new Set(),
  annotations: new Map(),
  readingMode: 'normal',
  theme: 'auto'
};

const articleReducer = (state: ArticleState, action: ArticleAction): ArticleState => {
  switch (action.type) {
    case 'SET_READING_PROGRESS':
      return { ...state, readingProgress: action.payload };
    
    case 'SET_CURRENT_SECTION':
      return { ...state, currentSection: action.payload };
    
    case 'TOGGLE_SECTION': {
      const newExpanded = new Set(state.expandedSections);
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload);
      } else {
        newExpanded.add(action.payload);
      }
      return { ...state, expandedSections: newExpanded };
    }
    
    case 'TOGGLE_BOOKMARK': {
      const newBookmarks = new Set(state.bookmarks);
      if (newBookmarks.has(action.payload)) {
        newBookmarks.delete(action.payload);
      } else {
        newBookmarks.add(action.payload);
      }
      return { ...state, bookmarks: newBookmarks };
    }
    
    case 'ADD_ANNOTATION': {
      const newAnnotations = new Map(state.annotations);
      newAnnotations.set(action.payload.id, action.payload.text);
      return { ...state, annotations: newAnnotations };
    }
    
    case 'REMOVE_ANNOTATION': {
      const newAnnotations = new Map(state.annotations);
      newAnnotations.delete(action.payload);
      return { ...state, annotations: newAnnotations };
    }
    
    case 'SET_READING_MODE':
      return { ...state, readingMode: action.payload };
    
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    default:
      return state;
  }
};

interface ArticleContextType extends ArticleState {
  setReadingProgress: (progress: number) => void;
  setCurrentSection: (section: string) => void;
  toggleSection: (section: string) => void;
  toggleBookmark: (id: string) => void;
  addAnnotation: (id: string, text: string) => void;
  removeAnnotation: (id: string) => void;
  setReadingMode: (mode: ArticleState['readingMode']) => void;
  setTheme: (theme: ArticleState['theme']) => void;
  isExpanded: (section: string) => boolean;
  isBookmarked: (id: string) => boolean;
  getAnnotation: (id: string) => string | undefined;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

interface ArticleProviderProps {
  children: React.ReactNode;
  articleId?: string;
}

export const ArticleProvider = React.memo(({ children, articleId }: ArticleProviderProps) => {
  const [state, dispatch] = useReducer(articleReducer, initialState);

  const setReadingProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_READING_PROGRESS', payload: progress });
  }, []);

  const setCurrentSection = useCallback((section: string) => {
    dispatch({ type: 'SET_CURRENT_SECTION', payload: section });
  }, []);

  const toggleSection = useCallback((section: string) => {
    dispatch({ type: 'TOGGLE_SECTION', payload: section });
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: id });
  }, []);

  const addAnnotation = useCallback((id: string, text: string) => {
    dispatch({ type: 'ADD_ANNOTATION', payload: { id, text } });
  }, []);

  const removeAnnotation = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ANNOTATION', payload: id });
  }, []);

  const setReadingMode = useCallback((mode: ArticleState['readingMode']) => {
    dispatch({ type: 'SET_READING_MODE', payload: mode });
  }, []);

  const setTheme = useCallback((theme: ArticleState['theme']) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const isExpanded = useCallback((section: string) => {
    return state.expandedSections.has(section);
  }, [state.expandedSections]);

  const isBookmarked = useCallback((id: string) => {
    return state.bookmarks.has(id);
  }, [state.bookmarks]);

  const getAnnotation = useCallback((id: string) => {
    return state.annotations.get(id);
  }, [state.annotations]);

  const contextValue: ArticleContextType = {
    ...state,
    setReadingProgress,
    setCurrentSection,
    toggleSection,
    toggleBookmark,
    addAnnotation,
    removeAnnotation,
    setReadingMode,
    setTheme,
    isExpanded,
    isBookmarked,
    getAnnotation
  };

  return (
    <ArticleContext.Provider value={contextValue}>
      {children}
    </ArticleContext.Provider>
  );
});

ArticleProvider.displayName = 'ArticleProvider';

export const useArticle = () => {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticle must be used within an ArticleProvider');
  }
  return context;
};

// Reading progress hook
export const useReadingProgress = () => {
  const { readingProgress, setReadingProgress } = useArticle();

  React.useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, [setReadingProgress]);

  return readingProgress;
};