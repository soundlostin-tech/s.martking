import { generateSlug, extractSlugId, calculateTrendingScore, sortByTrending, PostData, VideoData } from '../content-seo';

describe('generateSlug', () => {
  it('should generate a basic slug from title', () => {
    expect(generateSlug('My Amazing Post')).toBe('my-amazing-post');
  });

  it('should include game and mode in slug', () => {
    expect(generateSlug('Epic Win', 'Free Fire', 'Solo')).toBe('epic-win-free-fire-solo');
  });

  it('should handle special characters', () => {
    expect(generateSlug('Test!@#$%^&*()Post')).toBe('test-post');
  });

  it('should append id when provided', () => {
    const slug = generateSlug('My Post', undefined, undefined, 'abc12345-6789');
    expect(slug).toBe('my-post-abc12345');
  });

  it('should limit slug length to 80 characters', () => {
    const longTitle = 'A'.repeat(100);
    const slug = generateSlug(longTitle);
    expect(slug.length).toBeLessThanOrEqual(80);
  });

  it('should trim leading and trailing hyphens', () => {
    expect(generateSlug('---Test---')).toBe('test');
  });
});

describe('extractSlugId', () => {
  it('should extract 8-character id from slug', () => {
    expect(extractSlugId('my-post-abc12345')).toBe('abc12345');
  });

  it('should return null for slug without id', () => {
    expect(extractSlugId('my-post')).toBeNull();
  });

  it('should return null for slug with wrong length id', () => {
    expect(extractSlugId('my-post-abc')).toBeNull();
  });
});

describe('calculateTrendingScore', () => {
  const baseItem = {
    view_count: 100,
    like_count: 10,
    comment_count: 5,
    created_at: new Date().toISOString(),
  };

  it('should calculate score based on engagement', () => {
    const score = calculateTrendingScore(baseItem);
    expect(score).toBeGreaterThan(0);
  });

  it('should give higher scores to more recent content', () => {
    const recentItem = { ...baseItem, created_at: new Date().toISOString() };
    const oldItem = { ...baseItem, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() };
    
    const recentScore = calculateTrendingScore(recentItem);
    const oldScore = calculateTrendingScore(oldItem);
    
    expect(recentScore).toBeGreaterThan(oldScore);
  });

  it('should weight likes higher than views', () => {
    const viewItem = { ...baseItem, view_count: 50, like_count: 0 };
    const likeItem = { ...baseItem, view_count: 0, like_count: 10 };
    
    const viewScore = calculateTrendingScore(viewItem);
    const likeScore = calculateTrendingScore(likeItem);
    
    expect(likeScore).toBeGreaterThan(viewScore);
  });
});

describe('sortByTrending', () => {
  it('should sort items by trending score descending', () => {
    const items = [
      { view_count: 10, like_count: 1, comment_count: 0, created_at: new Date().toISOString() },
      { view_count: 100, like_count: 50, comment_count: 20, created_at: new Date().toISOString() },
      { view_count: 50, like_count: 10, comment_count: 5, created_at: new Date().toISOString() },
    ];
    
    const sorted = sortByTrending(items);
    
    expect(sorted[0].like_count).toBe(50);
    expect(sorted[2].like_count).toBe(1);
  });

  it('should not mutate original array', () => {
    const items = [
      { view_count: 10, like_count: 1, comment_count: 0, created_at: new Date().toISOString() },
      { view_count: 100, like_count: 50, comment_count: 20, created_at: new Date().toISOString() },
    ];
    const originalFirst = items[0];
    
    sortByTrending(items);
    
    expect(items[0]).toBe(originalFirst);
  });
});

export function validatePostSEO(post: PostData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!post.title || post.title.length < 5) {
    errors.push('Title must be at least 5 characters');
  }
  if (post.title && post.title.length > 100) {
    errors.push('Title should be under 100 characters');
  }
  if (!post.slug) {
    errors.push('Slug is required');
  }
  if (post.description && post.description.length > 300) {
    errors.push('Description should be under 300 characters');
  }

  return { valid: errors.length === 0, errors };
}

export function validateVideoSEO(video: VideoData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!video.title || video.title.length < 5) {
    errors.push('Title must be at least 5 characters');
  }
  if (video.title && video.title.length > 100) {
    errors.push('Title should be under 100 characters');
  }
  if (!video.slug) {
    errors.push('Slug is required');
  }
  if (!video.video_url) {
    errors.push('Video URL is required');
  }
  if (video.description && video.description.length > 300) {
    errors.push('Description should be under 300 characters');
  }
  if (!video.thumbnail_url) {
    errors.push('Thumbnail URL is recommended for better SEO');
  }

  return { valid: errors.length === 0, errors };
}

export const SEO_CHECKLIST = {
  post: [
    'Title is descriptive and includes game/mode keywords',
    'Description is concise (under 160 chars for search snippets)',
    'Thumbnail image is provided and optimized',
    'Slug is human-readable and includes relevant keywords',
    'Content is public and allow_indexing is true',
    'Author profile link is valid',
  ],
  video: [
    'Title is descriptive and includes game/mode keywords',
    'Description is concise (under 160 chars for search snippets)',
    'Thumbnail image is provided and optimized',
    'Video duration is specified for rich snippets',
    'Slug is human-readable and includes relevant keywords',
    'Content is public and allow_indexing is true',
    'Author profile link is valid',
  ],
};
