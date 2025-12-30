import { PostData, VideoData } from './content-seo';

export function validatePostSEO(post: PostData): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!post.title || post.title.length < 5) {
    errors.push('Title must be at least 5 characters');
  }
  if (post.title && post.title.length > 100) {
    warnings.push('Title should be under 100 characters for optimal display');
  }
  if (!post.slug) {
    errors.push('Slug is required');
  }
  if (post.description && post.description.length > 300) {
    warnings.push('Description should be under 160 characters for optimal search snippets');
  }
  if (!post.description) {
    warnings.push('Adding a description improves search visibility');
  }
  if (!post.thumbnail_url) {
    warnings.push('Thumbnail image recommended for social sharing');
  }
  if (post.is_public && !post.allow_indexing) {
    warnings.push('Public post not being indexed - consider enabling indexing');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateVideoSEO(video: VideoData): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!video.title || video.title.length < 5) {
    errors.push('Title must be at least 5 characters');
  }
  if (video.title && video.title.length > 100) {
    warnings.push('Title should be under 100 characters for optimal display');
  }
  if (!video.slug) {
    errors.push('Slug is required');
  }
  if (!video.video_url) {
    errors.push('Video URL is required');
  }
  if (video.description && video.description.length > 300) {
    warnings.push('Description should be under 160 characters for optimal search snippets');
  }
  if (!video.description) {
    warnings.push('Adding a description improves search visibility');
  }
  if (!video.thumbnail_url) {
    warnings.push('Thumbnail image is highly recommended for video SEO');
  }
  if (!video.duration_seconds) {
    warnings.push('Video duration helps search engines display rich snippets');
  }
  if (video.is_public && !video.allow_indexing) {
    warnings.push('Public video not being indexed - consider enabling indexing');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export const SEO_CHECKLIST = {
  post: [
    { id: 'title', label: 'Title is descriptive and includes game/mode keywords', required: true },
    { id: 'description', label: 'Description is concise (under 160 chars for search snippets)', required: false },
    { id: 'thumbnail', label: 'Thumbnail image is provided and optimized', required: false },
    { id: 'slug', label: 'Slug is human-readable and includes relevant keywords', required: true },
    { id: 'public', label: 'Content is public and allow_indexing is true', required: true },
    { id: 'author', label: 'Author profile link is valid', required: false },
  ],
  video: [
    { id: 'title', label: 'Title is descriptive and includes game/mode keywords', required: true },
    { id: 'description', label: 'Description is concise (under 160 chars for search snippets)', required: false },
    { id: 'thumbnail', label: 'Thumbnail image is provided and optimized', required: true },
    { id: 'duration', label: 'Video duration is specified for rich snippets', required: false },
    { id: 'slug', label: 'Slug is human-readable and includes relevant keywords', required: true },
    { id: 'public', label: 'Content is public and allow_indexing is true', required: true },
    { id: 'author', label: 'Author profile link is valid', required: false },
  ],
};

export function getCompletedChecklist(content: PostData | VideoData, type: 'post' | 'video'): string[] {
  const completed: string[] = [];
  const checklist = SEO_CHECKLIST[type];

  for (const item of checklist) {
    switch (item.id) {
      case 'title':
        if (content.title && content.title.length >= 5 && content.title.length <= 100) {
          completed.push(item.id);
        }
        break;
      case 'description':
        if (content.description && content.description.length <= 160) {
          completed.push(item.id);
        }
        break;
      case 'thumbnail':
        if (content.thumbnail_url) {
          completed.push(item.id);
        }
        break;
      case 'slug':
        if (content.slug) {
          completed.push(item.id);
        }
        break;
      case 'public':
        if (content.is_public && content.allow_indexing) {
          completed.push(item.id);
        }
        break;
      case 'author':
        if (content.user?.username || content.user?.full_name) {
          completed.push(item.id);
        }
        break;
      case 'duration':
        if (type === 'video' && (content as VideoData).duration_seconds) {
          completed.push(item.id);
        }
        break;
    }
  }

  return completed;
}

export function getSEOScore(content: PostData | VideoData, type: 'post' | 'video'): number {
  const checklist = SEO_CHECKLIST[type];
  const completed = getCompletedChecklist(content, type);
  
  let score = 0;
  let maxScore = 0;
  
  for (const item of checklist) {
    const weight = item.required ? 2 : 1;
    maxScore += weight;
    if (completed.includes(item.id)) {
      score += weight;
    }
  }
  
  return Math.round((score / maxScore) * 100);
}
