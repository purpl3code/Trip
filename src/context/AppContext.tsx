import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Post, User, Comment } from '../mockData';
import { mockPosts, mockUsers } from '../mockData';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { compressImage } from '../utils/imageCompressor';

const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%23cbd5e1"/><circle cx="12" cy="8" r="4" fill="%23ffffff"/><path d="M4 20c0-3 3-5 8-5s8 2 8 5" fill="%23ffffff"/></svg>';

interface AppContextType {
  posts: Post[];
  users: User[];
  currentUser: User | null;
  activeTab: 'feed' | 'search' | 'profile';
  setActiveTab: (tab: 'feed' | 'search' | 'profile') => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
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

const AppContext = createContext<AppContextType | undefined>(undefined);

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

  // Apply theme class to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('trip_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Setup Supabase auth listeners & load data
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Fallback: load mockup data
      const savedPosts = localStorage.getItem('trip_posts');
      const savedUsers = localStorage.getItem('trip_users');
      const loadedUsers = savedUsers ? JSON.parse(savedUsers) : mockUsers;
      setPosts(savedPosts ? JSON.parse(savedPosts) : mockPosts);
      setUsers(loadedUsers);
      setCurrentUser(loadedUsers[0]);
      setSelectedUser(loadedUsers[0]);
      setIsSessionLoading(false);
      return;
    }

    // 1. Get current session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session?.user) {
        loadData(session.user.id).finally(() => {
          setIsSessionLoading(false);
        });
      } else {
        setIsSessionLoading(false);
      }
    });

    // 2. Auth changes listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session?.user) {
        loadData(session.user.id).finally(() => {
          setIsSessionLoading(false);
        });
      } else {
        setCurrentUser(null);
        setSelectedUser(null);
        setPosts([]);
        setUsers([]);
        setIsSessionLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
  const loadData = async (currentUserId: string) => {
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

      setUsers(uiUsers);

      let activeProfile = uiUsers.find((u) => u.id === currentUserId) || null;

      // If RLS insert or email check left user profile missing in database, create it now!
      if (!activeProfile && isSupabaseConfigured) {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          const defaultUsername = sbUser.user_metadata?.username || sbUser.email?.split('@')[0] || `user_${Date.now()}`;
          const defaultDisplayName = sbUser.user_metadata?.display_name || sbUser.email?.split('@')[0] || 'Novo Viajante';
          const defaultBio = sbUser.user_metadata?.bio || '';

          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: currentUserId,
              username: defaultUsername,
              display_name: defaultDisplayName,
              bio: defaultBio,
              avatar_url: DEFAULT_AVATAR,
              banner_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
            });

          if (!insertError) {
            // Profile created successfully! Refetch data to sync
            await loadData(currentUserId);
            return;
          } else {
            console.error('Failed to create user profile on login:', insertError.message);
          }
        }
      }

      setCurrentUser(activeProfile);
      
      // Keep selectedUser in sync
      if (selectedUser) {
        const updatedSelected = uiUsers.find((u) => u.id === selectedUser.id);
        if (updatedSelected) setSelectedUser(updatedSelected);
      } else {
        setSelectedUser(activeProfile);
      }

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
          user: uiUsers.find((u) => u.id === p.user_id) || uiUsers[0],
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

      setPosts(uiPosts);
    } catch (e: any) {
      console.error('Error fetching database:', e.message);
    }
  };

  const refreshData = async () => {
    if (isSupabaseConfigured && session?.user) {
      await loadData(session.user.id);
    }
  };

  // Auth - Sign In
  const handleSignIn = async (email: string, password: string) => {
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Register your credentials in .env.');
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: any) {
      setAuthError(e.message);
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
    setIsAuthLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Register your credentials in .env.');
      }
      
      // 1. Check if username is already taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

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

      // 3. Try to Create User Profile manually (might fail if email confirmation is enabled, which is fine since loadData fallback handles it)
      const { error: profileError } = await supabase.from('profiles').insert({
        id: signUpData.user.id,
        username,
        display_name: displayName,
        bio,
        avatar_url: DEFAULT_AVATAR,
        banner_url: `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80`,
      });

      if (profileError) {
        console.warn('Profile direct insert failed, will trigger on-the-fly upon email validation login:', profileError.message);
      }

      // 4. Automatically log the user in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

    } catch (e: any) {
      setAuthError(e.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Auth - Sign Out
  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
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
    if (!currentUser) return;

    try {
      const uploadedUrls: string[] = [];

      // 1. Upload custom image files if selected
      if (isSupabaseConfigured && photoFiles && photoFiles.length > 0) {
        for (const file of photoFiles) {
          const compressedBlob = await compressImage(file);
          const fileExt = file.name.split('.').pop() || 'jpg';
          const fileName = `${currentUser.id}/${Date.now()}-${Math.round(
            Math.random() * 100000
          )}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('trip-media')
            .upload(fileName, compressedBlob, {
              contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
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
      alert('Falha ao adicionar relato: ' + e.message);
    }
  };

  const deletePost = async (postId: string) => {
    if (!currentUser) return;

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
      alert('Falha ao excluir relato: ' + e.message);
    }
  };

  // Add Comment
  const addComment = async (
    postId: string,
    content: string,
    rating?: number,
    verdict?: 'Gostei' | 'Não gostei'
  ) => {
    if (!currentUser) return;

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
      console.error('Error adding comment:', e.message);
    }
  };

  // Toggle Like
  const toggleLike = async (postId: string) => {
    if (!currentUser) return;

    const matchedPost = posts.find((p) => p.id === postId);
    if (!matchedPost) return;

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
      console.error('Error toggling like:', e.message);
    }
  };

  // Toggle Follow
  const toggleFollow = async (userId: string) => {
    if (!currentUser) return;

    const matchedUser = users.find((u) => u.id === userId);
    if (!matchedUser) return;

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
      console.error('Error toggling follow:', e.message);
    }
  };

  // Update Profile details and custom file uploads
  const updateProfile = async (
    displayName: string,
    bio: string,
    avatarFile?: File,
    bannerFile?: File
  ) => {
    if (!currentUser) return;

    try {
      let avatarUrl = currentUser.avatar;
      let bannerUrl = currentUser.banner;

      // 1. Upload new avatar if selected
      if (isSupabaseConfigured && avatarFile) {
        const compressedBlob = await compressImage(avatarFile);
        const fileExt = avatarFile.name.split('.').pop() || 'jpg';
        const fileName = `${currentUser.id}/avatar-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('trip-media')
          .upload(fileName, compressedBlob, {
            contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
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
        const fileExt = bannerFile.name.split('.').pop() || 'jpg';
        const fileName = `${currentUser.id}/banner-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('trip-media')
          .upload(fileName, compressedBlob, {
            contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
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
      alert('Falha ao atualizar perfil: ' + e.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
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

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
