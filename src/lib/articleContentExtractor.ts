// Content extraction utility for ReadingRoom PDF generation

// Article content mapping based on ReadingRoom slugs
export const articleContentMap: Record<string, any> = {
  '/riders-on-monsoon': {
    title: 'Riders on the Monsoon: Indigenous Navigation and Maritime Memory',
    author: 'Nartiang Foundation',
    content: `## Monsoon Masters of the Ancient World

The term "monsoon" itself comes from the Arabic *mausim* (season), a reminder that sailors from Arabia and India knew these seasonal winds intimately and early. In fact, modern research confirms that Indian navigators were exploiting monsoon wind patterns as far back as the Bronze Age.

Archaeological finds at sites like Lothal (in Gujarat) – a Harappan port with a tide dock – and references in Mesopotamian records suggest that sailing with the seasonal wind reversal was an established practice. This overturns the old belief that a Greek mariner Hippalus "discovered" the monsoon route in the 1st century BCE.`,
    tags: ['Maritime Memory', 'Indigenous Knowledge', 'Monsoon Navigation', 'Ancient Texts'],
    readTime: 15
  },
  
  '/pepper-and-bullion': {
    title: 'Pepper and Bullion: The Spice Routes that Connected India and Rome',
    author: 'Nartiang Foundation',
    content: `India's maritime trade in antiquity was legendary, forging links across oceans long before the age of European exploration. Central to this vast exchange was the humble peppercorn – the "black gold" that drew traders to India's shores for centuries.`,
    tags: ['Indo-Roman Trade', 'Muziris', 'Maritime Networks', 'Ancient Economics'],
    readTime: 25
  },
  
  '/scripts-that-sailed': {
    title: 'Riding the Monsoon Winds: Commerce, Culture and the Ancient Indian Ocean', 
    author: 'Kanika Rakesh',
    content: `From the earliest times, Indian Ocean mariners lived by the calendar of the monsoons. Every year, the winds reverse: summer brings the Southwest Monsoon (blowing northeast from Africa/Arabia toward India–Southeast Asia) and winter the Northeast Monsoon (blowing southwest back toward Africa). This seasonal "clock" knit together East Africa, Arabia, India and Southeast Asia in regular trade.

## The Monsoon Engine of Commerce

In practice this meant two annual sailing windows: about November–January, ships could sail from India to Africa on the northeast winds, and April–August the reverse. Navigators treated the monsoons as an engine of commerce – the great natural conveyer belts of antiquity.

The story of the monsoons is at once scientific and poetic: it is a tale of wind and wave, of starlight and navigation, but above all of people reaching out across the waves to create humanity's first truly global trade network.`,
    tags: ['Indian Ocean World', 'Maritime Trade', 'Monsoon Navigation', 'Cultural Exchange', 'Ancient Globalization'],
    readTime: 28
  }
};

// Get article content by slug
export function getArticleContent(slug: string) {
  return articleContentMap[slug] || null;
}

// Extract content for PDF generation
export function extractContentForPDF(slug: string) {
  const article = getArticleContent(slug);
  if (!article) return null;
  
  return {
    title: article.title,
    author: article.author,
    content: article.content,
    tags: article.tags,
    readTime: article.readTime
  };
}