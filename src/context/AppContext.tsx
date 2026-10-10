import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppContext } from './appState';
import type { Post, User, Comment } from '../mockData';
import { mockPosts, mockUsers } from '../mockData';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { compressImage } from '../utils/imageCompressor';
import { errorMessage } from '../utils/errors';

const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%23cbd5e1"/><circle cx="12" cy="8" r="4" fill="%23ffffff"/><path d="M4 20c0-3 3-5 8-5s8 2 8 5" fill="%23ffffff"/></svg>';

export interface AppContextType {
  posts: Post[];
  users: User[];
  currentUser: User | null;
  activeTab: 'feed' | 'search' | 'profile';
  setActiveTab: (tab: 'feed' | 'search' | 'profile') => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  notice: { message: string; kind: 'success' | 'error' } | null;
  notify: (message: string, kind?: 'success' | 'error') => void;
  dismissNotice: () => void;
  dataError: string | null;
  isRefreshing: boolean;
  authMessage: string | null;
  clearAuthFeedback: () => void;

  // Auth Functions
  isAuthLoading: boolean;
  isSessionLoading: boolean;
  authError: string | null;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleSignUp: (email: string, password: string, username: string, displayName: string, bio: string) => Promise<void>;
  handleSignOut: () => Promise<void>;
  
  // Database Functions
  addPost: (
    content: string,
    location: string,
    rating: number,
    verdict: 'Gostei' | 'Não gostei',
    presetPhotos: string[],
    photoFiles?: File[]
  ) => Promise<void>;
  addComment: (
    postId: string,
    content: string,
    rating?: number,
    verdict?: 'Gostei' | 'Não gostei'
  ) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  toggleFollow: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  updateProfile: (
    displayName: string,
    bio: string,
    avatarFile?: File,
    bannerFile?: File
  ) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (isOpen: boolean) => void;
  expandedPhotoUrl: string | null;
  setExpandedPhotoUrl: (url: string | null) => void;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('trip_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'feed' | 'search' | 'profile'>('feed');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [expandedPhotoUrl, setExpandedPhotoUrl] = useState<string | null>(null);

  // App core data states
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Auth processing states
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [notice, setNotice] = useState<{ message: string; kind: 'success' | 'error' } | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const requestId = useRef(0);
  const invalidateRequests = useCallback(() => { requestId.current++; }, []);
  const authUserId = useRef<string | null>(null);
  const pendingActions = useRef(new Set<string>());
  const notify = useCallback((message: string, kind: 'success' | 'error' = 'success') => setNotice({ message, kind }), []);
  const clearAuthFeedback = () => { setAuthError(null); setAuthMessage(null); };
  useEffect(() => {
    if (!notice || notice.kind === 'error') return;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // Apply theme class to document element & update mobile status bar theme metas
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('trip_theme', theme);

    // Update <meta name="theme-color"> dynamically
    const themeColor = theme === 'dark' ? '#0B0E14' : '#F8FAFC';
    const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]');
    if (metaThemeColors.length > 0) {
      metaThemeColors.forEach((m) => m.setAttribute('content', themeColor));
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', themeColor);
      document.head.appendChild(meta);
    }

    // Update <meta name="apple-mobile-web-app-status-bar-style"> dynamically
    const statusBarStyle = theme === 'dark' ? 'black-translucent' : 'default';
    const metaStatusStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (metaStatusStyle) {
      metaStatusStyle.setAttribute('content', statusBarStyle);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync offline mock data to localStorage when modified (only in fallback mode)
  useEffect(() => {
    if (!isSupabaseConfigured && posts.length > 0) {
      localStorage.setItem('trip_posts', JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    if (!isSupabaseConfigured && users.length > 0) {
      localStorage.setItem('trip_users', JSON.stringify(users));
    }
  }, [users]);

  // Load all application datasets from Supabase
  const loadData = useCallback(async function fetchData(currentUserId: string) {
    const request = ++requestId.current;
    try {
      // Fetch profiles
      const { data: dbProfiles, error: profError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profError) throw profError;

      // Fetch follows
      const { data: dbFollows, error: followError } = await supabase
        .from('follows')
        .select('*');
      
      if (followError) throw followError;

      // Map DB profiles to UI User format
      const uiUsers: User[] = (dbProfiles || []).map((prof: any) => {
        const followers = (dbFollows || []).filter((f: any) => f.following_id === prof.id);
        const following = (dbFollows || []).filter((f: any) => f.follower_id === prof.id);
        const isFollowing = (dbFollows || []).some(
          (f: any) => f.follower_id === currentUserId && f.following_id === prof.id
        );

        return {
          id: prof.id,
          username: prof.username,
          displayName: prof.display_name,
          avatar: (prof.avatar_url && !prof.avatar_url.includes('photo-1535713875002-d1d0cf377fde')) ? prof.avatar_url : DEFAULT_AVATAR,
          banner: prof.banner_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
          bio: prof.bio || '',
          followersCount: followers.length,
          followingCount: following.length,
          isFollowing,
        };
      });

      if (request !== requestId.current || authUserId.current !== currentUserId) return;
      setUsers(uiUsers);

      const activeProfile = uiUsers.find((u) => u.id === currentUserId) || null;

      // If RLS insert or email check left user profile missing in database, create it now!
      if (!activeProfile && isSupabaseConfigured) {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          const defaultUsername = sbUser.user_metadata?.username || sbUser.email?.split('@')[0] || `user_${Date.now()}`;
          const defaultDisplayName = sbUser.user_metadata?.display_name || sbUser.email?.split('@')[0] || 'Novo Viajante';
          const defaultBio = sbUser.user_metadata?.bio || '';

          const { error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: currentUserId,
              username: defaultUsername,
              display_name: defaultDisplayName,
              bio: defaultBio,
              avatar_url: DEFAULT_AVATAR,
              banner_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
            });

          if (!insertError) {
            // Profile created successfully! Refetch data to sync
            await fetchData(currentUserId);
            return;
          } else {
            console.error('Failed to create user profile on login:', insertError.message);
          }
        }
        throw new Error('Não foi possível carregar seu perfil. Tente entrar novamente.');
      }

      setCurrentUser(activeProfile);
      
      setSelectedUser(previous => uiUsers.find(user => user.id === previous?.id) || activeProfile);

      // Fetch Posts, including user profiles, comments, and likes
      const { data: dbPosts, error: postsError } = await supabase
        .from('posts')
        .select('*, user:profiles!user_id(*), comments(*, user:profiles!user_id(*)), likes(user_id)')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const uiPosts: Post[] = (dbPosts || []).map((p: any) => {
        const postLikes = p.likes || [];
        const isLiked = postLikes.some((l: any) => l.user_id === currentUserId);
        
        const mappedComments: Comment[] = (p.comments || [])
          .map((c: any) => ({
            id: c.id,
            user: uiUsers.find((u) => u.id === c.user_id) || {
              id: c.user_id,
              username: 'user',
              displayName: 'User',
              avatar: DEFAULT_AVATAR,
              banner: '',
              bio: '',
              followersCount: 0,
              followingCount: 0,
              isFollowing: false
            },
            content: c.content,
            rating: c.rating ?? undefined,
            verdict: c.verdict ?? undefined,
            createdAt: c.created_at,
          }))
          .sort((a: Comment, b: Comment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        return {
          id: p.id,
          user: uiUsers.find((u) => u.id === p.user_id) || {
            id: p.user_id, username: 'viajante', displayName: 'Viajante', avatar: DEFAULT_AVATAR,
            banner: '', bio: '', followersCount: 0, followingCount: 0, isFollowing: false,
          },
          content: p.content,
          location: p.location,
          rating: p.rating,
          verdict: p.verdict,
          photos: p.photos || [],
          likesCount: postLikes.length,
          isLiked,
          comments: mappedComments,
          createdAt: p.created_at,
        };
      });

      if (request !== requestId.current || authUserId.current !== currentUserId) return;
      setPosts(uiPosts);
      setDataError(null);
    } catch (e: unknown) {
      if (request !== requestId.current || authUserId.current !== currentUserId) return;
      setDataError(errorMessage(e, 'Não foi possível carregar os relatos.'));
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const loadedUsers = JSON.parse(localStorage.getItem('trip_users') || 'null') || mockUsers;
      setPosts(JSON.parse(localStorage.getItem('trip_posts') || 'null') || mockPosts);
      setUsers(loadedUsers);
      setCurrentUser(loadedUsers[0]);
      setSelectedUser(loadedUsers[0]);
      setIsSessionLoading(false);
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, nextSession: any) => {
      if (!active) return;
      setSession(nextSession);
      const id = nextSession?.user?.id || null;
      if (id === authUserId.current && _event !== 'INITIAL_SESSION') return;
      authUserId.current = id;
      requestId.current++;
      clearTimeout(timer);
      if (id) {
        setIsSessionLoading(true);
        // Defer requests until Supabase has released its auth callback lock.
        timer = setTimeout(() => {
          void loadData(id).finally(() => { if (active && authUserId.current === id) setIsSessionLoading(false); });
        }, 0);
      } else {
        setCurrentUser(null);
        setSelectedUser(null);
        setPosts([]);
        setUsers([]);
        setDataError(null);
        setActiveTab('feed');
        setIsEditProfileOpen(false);
        setExpandedPhotoUrl(null);
        setIsSessionLoading(false);
      }
    });
    return () => { active = false; invalidateRequests(); clearTimeout(timer); subscription.unsubscribe(); };
  }, [loadData, invalidateRequests]);

  const refreshData = async () => {
    if (isSupabaseConfigured && session?.user) {
      setIsRefreshing(true);
      try { await loadData(session.user.id); }
      finally { setIsRefreshing(false); }
    }
  };

  // Auth - Sign In
  const handleSignIn = async (email: string, password: string) => {
    setAuthError(null);
    setAuthMessage(null);
    setIsAuthLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Register your credentials in .env.');
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    } catch (e: any) {
      setAuthError(errorMessage(e));
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Auth - Sign Up
  const handleSignUp = async (
    email: string,
    password: string,
    username: string,
    displayName: string,
    bio: string
  ) => {
    setAuthError(null);
    setAuthMessage(null);
    setIsAuthLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Register your credentials in .env.');
      }
      
      // 1. Check if username is already taken
      username = username.trim().toLowerCase();
      displayName = displayName.trim();
      email = email.trim();
      if (!/^[a-z0-9_]{3,30}$/.test(username)) throw new Error('Use de 3 a 30 letras, números ou sublinhados no nome de usuário.');
      const { data: existingUser, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (usernameError) throw usernameError;
      if (existingUser) {
        throw new Error('Nome de usuário já está em uso.');
      }

      // 2. Sign up Auth user, embedding profile data in metadata options
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
            bio: bio
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('Falha ao registrar usuário.');

      // The auth listener creates missing profiles after a session is available.
      if (!signUpData.session) {
        setAuthMessage('Conta criada! Confira seu e-mail para confirmar o cadastro e depois entre.');
      }

    } catch (e: any) {
      setAuthError(errorMessage(e));
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Auth - Sign Out
  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) { notify(errorMessage(error), 'error'); return; }
    } else {
      console.warn('Signing out mock user.');
    }
  };

  // Create Post
  const addPost = async (
    content: string,
    location: string,
    rating: number,
    verdict: 'Gostei' | 'Não gostei',
    presetPhotos: string[],
    photoFiles?: File[]
  ) => {
    if (!currentUser) throw new Error('Entre na sua conta para continuar.');

    if (!content.trim() || !location.trim()) throw new Error('Informe o local e conte sua experiência.');
    if (rating < 1 || rating > 5) throw new Error('Escolha uma nota de 1 a 5.');
    content = content.trim();
    location = location.trim();
    try {
      const uploadedUrls: string[] = [];

      // 1. Upload custom image files if selected
      if (isSupabaseConfigured && photoFiles && photoFiles.length > 0) {
        for (const file of photoFiles) {
          const compressedBlob = await compressImage(file);
          const fileExt = compressedBlob.type === 'image/png' ? 'png' : compressedBlob.type === 'image/webp' ? 'webp' : 'jpg';
          const fileName = `${currentUser.id}/${Date.now()}-${Math.round(
            Math.random() * 100000
          )}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('trip-media')
            .upload(fileName, compressedBlob, {
              contentType: compressedBlob.type,
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('trip-media')
            .getPublicUrl(fileName);

          uploadedUrls.push(publicUrl);
        }
      }

      const combinedPhotos = [...presetPhotos, ...uploadedUrls];

      // 2. Insert post database record
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('posts').insert({
          content,
          location,
          rating,
          verdict,
          photos: combinedPhotos,
          user_id: currentUser.id,
        });

        if (error) throw error;
        await loadData(currentUser.id);
      } else {
        // Fallback: offline memory state
        const newPost: Post = {
          id: `post-${Date.now()}`,
          user: currentUser,
          content,
          location,
          rating,
          verdict,
          photos: combinedPhotos,
          likesCount: 0,
          isLiked: false,
          comments: [],
          createdAt: new Date().toISOString(),
        };
        setPosts((prev) => [newPost, ...prev]);
      }
    } catch (e: any) {
      console.error('Error adding post:', e.message);
      throw new Error(errorMessage(e));
    }
  };

  const deletePost = async (postId: string) => {
    if (!currentUser) throw new Error('Entre na sua conta para continuar.');
    if (!posts.some(post => post.id === postId && post.user.id === currentUser.id)) throw new Error('Você só pode excluir seus próprios relatos.');

    try {
      if (isSupabaseConfigured) {
        // Delete comments first
        const { error: commentsError } = await supabase
          .from('comments')
          .delete()
          .eq('post_id', postId);
        
        if (commentsError) throw commentsError;

        // Delete likes first
        const { error: likesError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId);

        if (likesError) throw likesError;

        // Delete the post
        const { error: postError } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId)
          .eq('user_id', currentUser.id);

        if (postError) throw postError;

        await loadData(currentUser.id);
      } else {
        // Fallback: offline memory state
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (e: any) {
      console.error('Error deleting post:', e.message);
      throw new Error(errorMessage(e));
    }
  };

  // Add Comment
  const addComment = async (
    postId: string,
    content: string,
    rating?: number,
    verdict?: 'Gostei' | 'Não gostei'
  ) => {
    if (!currentUser) throw new Error('Entre na sua conta para continuar.');

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('comments').insert({
          post_id: postId,
          user_id: currentUser.id,
          content,
          rating: rating ?? null,
          verdict: verdict ?? null,
        });

        if (error) throw error;
        await loadData(currentUser.id);
      } else {
        // Fallback: offline memory state
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          user: currentUser,
          content,
          rating,
          verdict,
          createdAt: new Date().toISOString(),
        };

        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [...post.comments, newComment],
              };
            }
            return post;
          })
        );
      }
    } catch (e: any) {
      throw new Error(errorMessage(e));
    }
  };

  // Toggle Like
  const toggleLike = async (postId: string) => {
    if (!currentUser) throw new Error('Entre na sua conta para continuar.');

    const actionKey = 'like:' + postId;
    if (pendingActions.current.has(actionKey)) return;
    const matchedPost = posts.find((p) => p.id === postId);
    if (!matchedPost) return;
    pendingActions.current.add(actionKey);

    try {
      if (isSupabaseConfigured) {
        if (matchedPost.isLiked) {
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', currentUser.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('likes')
            .insert({ post_id: postId, user_id: currentUser.id });

          if (error) throw error;
        }
        await loadData(currentUser.id);
      } else {
        // Fallback: offline memory state
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              const isLiked = !post.isLiked;
              return {
                ...post,
                isLiked,
                likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1,
              };
            }
            return post;
          })
        );
      }
    } catch (e: any) {
      throw new Error(errorMessage(e));
    } finally { pendingActions.current.delete(actionKey); }
  };

  // Toggle Follow
  const toggleFollow = async (userId: string) => {
    if (!currentUser) throw new Error('Entre na sua conta para continuar.');

    if (userId === currentUser.id) throw new Error('Você não pode seguir a própria conta.');
    const actionKey = 'follow:' + userId;
    if (pendingActions.current.has(actionKey)) return;
    const matchedUser = users.find((u) => u.id === userId);
    if (!matchedUser) return;
    pendingActions.current.add(actionKey);

    try {
      if (isSupabaseConfigured) {
        if (matchedUser.isFollowing) {
          const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', currentUser.id)
            .eq('following_id', userId);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('follows')
            .insert({ follower_id: currentUser.id, following_id: userId });

          if (error) throw error;
        }
        await loadData(currentUser.id);
      } else {
        // Fallback: offline memory state
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            if (user.id === userId) {
              const isFollowing = !user.isFollowing;
              return {
                ...user,
                isFollowing,
                followersCount: isFollowing ? user.followersCount + 1 : user.followersCount - 1,
              };
            }
            return user;
          })
        );

        if (selectedUser?.id === userId) {
          setSelectedUser((prev) => {
            if (!prev) return null;
            const isFollowing = !prev.isFollowing;
            return {
              ...prev,
              isFollowing,
              followersCount: isFollowing ? prev.followersCount + 1 : prev.followersCount - 1,
            };
          });
        }
      }
    } catch (e: any) {
      throw new Error(errorMessage(e));
    } finally { pendingActions.current.delete(actionKey); }
  };

  // Update Profile details and custom file uploads
  const updateProfile = async (
    displayName: string,
    bio: string,
    avatarFile?: File,
    bannerFile?: File
  ) => {
    if (!currentUser) throw new Error('Entre na sua conta para continuar.');

    try {
      let avatarUrl = currentUser.avatar;
      let bannerUrl = currentUser.banner;

      // 1. Upload new avatar if selected
      if (isSupabaseConfigured && avatarFile) {
        const compressedBlob = await compressImage(avatarFile);
        const fileExt = compressedBlob.type === 'image/png' ? 'png' : compressedBlob.type === 'image/webp' ? 'webp' : 'jpg';
        const fileName = `${currentUser.id}/avatar-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('trip-media')
          .upload(fileName, compressedBlob, {
            contentType: compressedBlob.type,
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('trip-media')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // 2. Upload new banner if selected
      if (isSupabaseConfigured && bannerFile) {
        const compressedBlob = await compressImage(bannerFile);
        const fileExt = compressedBlob.type === 'image/png' ? 'png' : compressedBlob.type === 'image/webp' ? 'webp' : 'jpg';
        const fileName = `${currentUser.id}/banner-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('trip-media')
          .upload(fileName, compressedBlob, {
            contentType: compressedBlob.type,
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('trip-media')
          .getPublicUrl(fileName);

        bannerUrl = publicUrl;
      }

      // 3. Update database record
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: displayName,
            bio: bio,
            avatar_url: avatarUrl,
            banner_url: bannerUrl
          })
          .eq('id', currentUser.id);

        if (error) throw error;
        await loadData(currentUser.id);
      } else {
        // Fallback: offline memory state
        setUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u.id === currentUser.id) {
              return {
                ...u,
                displayName,
                bio,
                avatar: avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl,
                banner: bannerFile ? URL.createObjectURL(bannerFile) : bannerUrl
              };
            }
            return u;
          })
        );
        
        setCurrentUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            displayName,
            bio,
            avatar: avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl,
            banner: bannerFile ? URL.createObjectURL(bannerFile) : bannerUrl
          };
        });
      }
    } catch (e: any) {
      console.error('Error updating profile:', e.message);
      throw new Error(errorMessage(e));
    }
  };

  return (
    <AppContext.Provider
      value={{
        notice, notify, dismissNotice: () => setNotice(null), dataError, isRefreshing, authMessage, clearAuthFeedback,
        posts,
        users,
        currentUser,
        activeTab,
        setActiveTab,
        selectedUser,
        setSelectedUser,
        theme,
        toggleTheme,
        isAuthLoading,
        isSessionLoading,
        authError,
        handleSignIn,
        handleSignUp,
        handleSignOut,
        addPost,
        addComment,
        toggleLike,
        toggleFollow,
        refreshData,
        updateProfile,
        deletePost,
        isEditProfileOpen,
        setIsEditProfileOpen,
        expandedPhotoUrl,
        setExpandedPhotoUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
