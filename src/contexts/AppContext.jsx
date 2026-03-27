import { createContext, useContext, useState, useCallback } from 'react';
import { I } from '../data/i18n.js';
import { ROLES, STORE_LIST, MULTI_STORE } from '../data/constants.js';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState('ja');
  const [curRole, setCurRoleRaw] = useState('store');
  const [curPage, setCurPage] = useState('rec');
  const [curStore, setCurStore] = useState(['80012']);
  const [pinned, setPinned] = useState(false);

  const t = useCallback(
    (key) => {
      const langData = I[lang];
      if (langData && key in langData) return langData[key];
      if (I.en && key in I.en) return I.en[key];
      return key;
    },
    [lang]
  );

  const allStoreIds = STORE_LIST.map((s) => s.id);

  const setCurRole = useCallback(
    (newRole) => {
      setCurRoleRaw(newRole);
      const pages = ROLES[newRole]?.pages ?? [];
      setCurPage((prev) => (pages.includes(prev) ? prev : pages[0] ?? prev));
      // admin & operator default to all stores; others get first store
      if (MULTI_STORE.includes(newRole) && ['admin', 'operator'].includes(newRole)) {
        setCurStore(allStoreIds);
      } else {
        setCurStore([allStoreIds[0]]);
      }
    },
    [allStoreIds]
  );

  const value = {
    lang,
    setLang,
    curRole,
    setCurRole,
    curPage,
    setCurPage,
    curStore,
    setCurStore,
    pinned,
    setPinned,
    t,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
