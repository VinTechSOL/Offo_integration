import { useState, useCallback, useEffect } from "react";
import { getUserContextDetails } from "../api/userContext";

export interface UserContextState {
  city_id: number;
  campus_id: number;
  building_id: number | null;
  city_name: string;
  campus_name: string;
  building_name: string | null;
}

export const useUserContext = () => {
  const [context, setContext] = useState<UserContextState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const ctx = await getUserContextDetails();
      if (!ctx) {
        setContext(null);
        return null;
      }

      const mapped: UserContextState = {
        city_id: ctx.city_id,
        campus_id: ctx.campus_id,
        building_id: ctx.building_id ?? null,
        city_name: ctx.city_name,
        campus_name: ctx.campus_name,
        building_name: ctx.building_name ?? null,
      };

      setContext(mapped);
      return mapped;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 AUTO LOAD ON FIRST USE
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { context, loading, refresh };
};
