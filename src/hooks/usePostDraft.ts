import { useEffect, useRef, useState } from 'react';
import { emptyPostDraft, hasPostDraft, restorePostDraft } from '../utils/postDraft';
import type { PostDraft } from '../utils/postDraft';

const openDatabase = () => new Promise<IDBDatabase>((resolve,reject) => {
  const request = indexedDB.open('trip-drafts',2);
  let rejected = false;
  request.onupgradeneeded = () => {
    for (const store of ['posts','photos']) if (!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store);
  };
  request.onsuccess = () => { if (rejected) request.result.close(); else resolve(request.result); };
  request.onerror = () => reject(request.error);
  request.onblocked = () => { rejected = true; reject(new Error('Draft storage unavailable')); };
});
async function readDraft(key: string) {
  const db = await openDatabase();
  try { return await new Promise<unknown>((resolve,reject) => {
    const tx = db.transaction(['posts','photos']);
    const metadata = tx.objectStore('posts').get(key);
    const photos = tx.objectStore('photos').get(key);
    tx.oncomplete = () => resolve(metadata.result ? {...metadata.result,files:photos.result || metadata.result.files || []} : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  }); } finally { db.close(); }
}
async function writeDraft(key: string, draft: PostDraft, saveFiles: boolean) {
  const db = await openDatabase();
  try { await new Promise<void>((resolve,reject) => {
    const tx = db.transaction(['posts','photos'],'readwrite');
    if (hasPostDraft(draft)) {
      const {files,...metadata} = draft;
      tx.objectStore('posts').put(metadata,key);
      if (saveFiles) tx.objectStore('photos').put(files,key);
    } else {
      tx.objectStore('posts').delete(key); tx.objectStore('photos').delete(key);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  }); } finally { db.close(); }
}
export function usePostDraft(userId: string) {
  const [draft,setDraft] = useState<PostDraft>(emptyPostDraft);
  const [ready,setReady] = useState(false);
  const [saveState,setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const current = useRef(draft);
  const loaded = useRef(false);
  const savedFiles = useRef<File[] | null>(null);
  const queue = useRef(Promise.resolve());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const alive = useRef(false);
  current.current = draft;
  // Serial writes prevent an earlier slow save from overwriting a newer draft.
  const persist = useRef<(snapshot: PostDraft) => Promise<void>>(async () => {});
  persist.current = snapshot => {
    queue.current = queue.current.catch(() => {}).then(async () => {
      await writeDraft(userId,snapshot,snapshot.files !== savedFiles.current);
      savedFiles.current = snapshot.files;
    });
    return queue.current;
  };
  useEffect(() => {
    let active = true;
    alive.current = true;
    void readDraft(userId).then(value => {
      if (active) {
        const restored = restorePostDraft(value);
        savedFiles.current = restored.files;
        setDraft(restored); loaded.current = true; setReady(true);
      }
    }).catch(() => {
      if (active) { loaded.current = true; setReady(true); setSaveState('error'); }
    });
    const flush = () => {
      if (!loaded.current) return;
      clearTimeout(timer.current);
      void persist.current(current.current).catch(() => {});
    };
    const visibility = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange',visibility);
    window.addEventListener('pagehide',flush);
    return () => {
      active = false; alive.current = false; flush();
      document.removeEventListener('visibilitychange',visibility);
      window.removeEventListener('pagehide',flush);
    };
  },[userId]);
  useEffect(() => {
    if (!ready) return;
    setSaveState('saving');
    timer.current = setTimeout(() => {
      void persist.current(draft).then(() => { if (alive.current && current.current === draft) setSaveState('saved'); }).catch(() => { if (alive.current && current.current === draft) setSaveState('error'); });
    },450);
    return () => clearTimeout(timer.current);
  },[draft,ready,userId]);
  const clearDraft = async () => {
    clearTimeout(timer.current);
    const empty = emptyPostDraft();
    current.current = empty; setDraft(empty);
    try { await persist.current(empty); setSaveState('saved'); } catch { setSaveState('error'); }
  };
  const setField = <K extends keyof PostDraft>(key: K, value: PostDraft[K] | ((previous: PostDraft[K]) => PostDraft[K])) => {
    setDraft(previous => ({...previous,[key]:typeof value === 'function' ? (value as (v: PostDraft[K]) => PostDraft[K])(previous[key]) : value}));
  };
  return { draft, setField, clearDraft, ready, saveState };
}
