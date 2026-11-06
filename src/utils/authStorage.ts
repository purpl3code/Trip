type StorageAccess = () => Pick<Storage,'getItem' | 'setItem' | 'removeItem'>;
// Storage can be unavailable in private/restricted WebViews. Keep that session
// in memory instead of preventing authentication altogether.
export function createAuthStorage(local: StorageAccess, session: StorageAccess) {
  const memory = new Map<string,string>();
  let keepLogged = true;
  let preferenceOverride: boolean | undefined;
  const getKeepLogged = () => {
    if (preferenceOverride !== undefined) return preferenceOverride;
    try {
      const saved = local().getItem('trip_keep_logged');
      if (saved !== null) keepLogged = saved !== 'false';
    } catch { /* Use the preference for this session. */ }
    return keepLogged;
  };
  const setKeepLogged = (value: boolean) => {
    keepLogged = value;
    try { local().setItem('trip_keep_logged',String(value)); preferenceOverride = undefined; }
    catch { preferenceOverride = value; }
  };
  const storage = {
    getItem(key: string): string | null {
      try { return (getKeepLogged() ? local() : session()).getItem(key) ?? memory.get(key) ?? null; }
      catch { return memory.get(key) ?? null; }
    },
    setItem(key: string,value: string) {
      const keep = getKeepLogged();
      try { (keep ? local() : session()).setItem(key,value); memory.delete(key); }
      catch { memory.set(key,value); }
      try { (keep ? session() : local()).removeItem(key); } catch { /* The other store may also be restricted. */ }
    },
    removeItem(key: string) {
      memory.delete(key);
      for (const access of [local,session]) { try { access().removeItem(key); } catch { /* Clear all available stores. */ } }
    },
  };
  return { storage,getKeepLogged,setKeepLogged };
}
export const authStorage = createAuthStorage(() => localStorage,() => sessionStorage);
