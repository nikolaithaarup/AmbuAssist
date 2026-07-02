import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ToolId } from "../navigation/toolRegistry";
import {
  addFavourite,
  normalizeToolIds,
  recordRecentTool,
  removeFavourite,
} from "./toolPreferencesHelpers";

const STORAGE_KEY = "ambuassist.tool-preferences.v1";

type ToolPreferencesContextValue = {
  favouriteIds: ToolId[];
  recentIds: ToolId[];
  addToFavourites: (id: ToolId) => void;
  removeFromFavourites: (id: ToolId) => void;
  recordToolOpened: (id: ToolId) => void;
};

const ToolPreferencesContext = createContext<ToolPreferencesContextValue | null>(null);

export function ToolPreferencesProvider({ children }: PropsWithChildren) {
  const [favouriteIds, setFavouriteIds] = useState<ToolId[]>([]);
  const [recentIds, setRecentIds] = useState<ToolId[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : null;
        if (!active) return;

        setFavouriteIds(normalizeToolIds(parsed?.favouriteIds));
        setRecentIds(normalizeToolIds(parsed?.recentIds).slice(0, 8));
      } catch {
        if (!active) return;
        setFavouriteIds([]);
        setRecentIds([]);
      } finally {
        if (active) setIsReady(true);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ favouriteIds, recentIds }),
    ).catch(() => {});
  }, [favouriteIds, recentIds, isReady]);

  const addToFavourites = useCallback((id: ToolId) => {
    setFavouriteIds((current) => addFavourite(current, id));
  }, []);
  const removeFromFavourites = useCallback((id: ToolId) => {
    setFavouriteIds((current) => removeFavourite(current, id));
  }, []);
  const recordToolOpened = useCallback((id: ToolId) => {
    setRecentIds((current) => recordRecentTool(current, id));
  }, []);

  const value = useMemo(
    () => ({
      favouriteIds,
      recentIds,
      addToFavourites,
      removeFromFavourites,
      recordToolOpened,
    }),
    [favouriteIds, recentIds, addToFavourites, removeFromFavourites, recordToolOpened],
  );

  return (
    <ToolPreferencesContext.Provider value={value}>
      {children}
    </ToolPreferencesContext.Provider>
  );
}

export function useToolPreferences() {
  const context = useContext(ToolPreferencesContext);
  if (!context) {
    throw new Error("useToolPreferences must be used within ToolPreferencesProvider");
  }
  return context;
}
