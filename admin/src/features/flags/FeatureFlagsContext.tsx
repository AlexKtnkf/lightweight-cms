import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../../shared/api/client';

type Flags = Record<string, boolean>;

interface FeatureFlagsContextValue {
  flags: Flags;
  isEnabled: (flag: string) => boolean;
  loading: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue>({
  flags: {},
  isEnabled: () => true, // fail-open default
  loading: true,
});

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Flags>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/features')
      .then((res: { data: Flags }) => setFlags(res.data))
      .catch(() => {
        // If the endpoint is unreachable, fail open — all features enabled
        setFlags({});
      })
      .finally(() => setLoading(false));
  }, []);

  function isEnabled(flag: string): boolean {
    if (!(flag in flags)) return true; // unknown flag → fail open
    return flags[flag];
  }

  return (
    <FeatureFlagsContext.Provider value={{ flags, isEnabled, loading }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
