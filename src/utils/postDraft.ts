export interface PostDraft {
  content: string;
  location: string;
  rating: number;
  verdict: 'Gostei' | 'Não gostei';
  files: File[];
}
export const emptyPostDraft = (): PostDraft => ({ content:'', location:'', rating:5, verdict:'Gostei', files:[] });
export function restorePostDraft(value: unknown): PostDraft {
  if (!value || typeof value !== 'object') return emptyPostDraft();
  const input = value as Partial<PostDraft>;
  return {
    content: typeof input.content === 'string' ? input.content.slice(0,5000) : '',
    location: typeof input.location === 'string' ? input.location.slice(0,120) : '',
    rating: typeof input.rating === 'number' && Number.isInteger(input.rating) && input.rating >= 1 && input.rating <= 5 ? input.rating : 5,
    verdict: input.verdict === 'Não gostei' ? 'Não gostei' : 'Gostei',
    files: Array.isArray(input.files) ? input.files.filter((file): file is File => file instanceof File && ['image/jpeg','image/png','image/webp'].includes(file.type) && file.size <= 10*1024*1024).slice(0,8) : [],
  };
}
export const hasPostDraft = (draft: PostDraft) => !!(draft.content || draft.location || draft.files.length || draft.rating !== 5 || draft.verdict !== 'Gostei');
