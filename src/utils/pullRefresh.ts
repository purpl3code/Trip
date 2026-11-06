export const REFRESH_THRESHOLD = 64;
export const MAX_PULL_DISTANCE = 88;

export function pullDistance(startX: number, startY: number, x: number, y: number, scrollTop: number, touches = 1) {
  const dx = x - startX;
  const dy = y - startY;
  if (touches !== 1 || scrollTop > 1 || dy <= 0 || Math.abs(dx) > dy) return 0;
  return Math.min(MAX_PULL_DISTANCE, dy * .45);
}
