import type { Post } from '../mockData';

export const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const ratingValues = (post: Post) => [post.rating, ...post.comments.map(comment => comment.rating)].filter((rating): rating is number => typeof rating === 'number' && Number.isFinite(rating) && rating >= 1 && rating <= 5);
export const averageRating = (ratings: number[]) => ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
export function groupLocations(posts: Post[]) {
  const groups = new Map<string, { name: string; posts: Post[]; ratings: number[] }>();
  for (const post of posts) {
    const key = normalizeSearch(post.location);
    if (!key) continue;
    const group = groups.get(key) || { name: post.location.trim(), posts: [], ratings: [] };
    group.posts.push(post);
    group.ratings.push(...ratingValues(post));
    groups.set(key, group);
  }
  return Array.from(groups.values()).map(group => ({ ...group, rating: averageRating(group.ratings) }));
}
