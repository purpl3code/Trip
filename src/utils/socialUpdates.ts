import type { Post, User } from '../mockData';

export function withLike(post: Post, liked: boolean): Post {
  if (!!post.isLiked === liked) return post;
  return { ...post,isLiked:liked,likesCount:Math.max(0,post.likesCount + (liked ? 1 : -1)) };
}
export function withFollow(user: User, actorId: string, targetId: string, following: boolean, delta: number): User {
  if (user.id !== actorId && user.id !== targetId) return user;
  return {
    ...user,
    ...(user.id === targetId ? { isFollowing:following,followersCount:Math.max(0,user.followersCount + delta) } : {}),
    ...(user.id === actorId ? { followingCount:Math.max(0,user.followingCount + delta) } : {}),
  };
}
export function withPostUsers(post: Post, update: (user: User) => User): Post {
  const user = update(post.user);
  const comments = post.comments.map(comment => {
    const commenter = update(comment.user);
    return commenter === comment.user ? comment : { ...comment,user:commenter };
  });
  return user === post.user && comments.every((comment,index) => comment === post.comments[index])
    ? post : { ...post,user,comments };
}

export async function commitOptimistic({ apply,persist,rollback }: {
  apply: () => void;
  persist: () => Promise<void>;
  rollback: () => void;
}) {
  apply();
  try { await persist(); }
  catch (error) { rollback(); throw error; }
}

// Reads started before a write settled may still contain its old relationship.
export function shouldOverlaySocialChange(change: { settledRequest?: number }, readRequest: number): boolean {
  return change.settledRequest === undefined || readRequest <= change.settledRequest;
}
