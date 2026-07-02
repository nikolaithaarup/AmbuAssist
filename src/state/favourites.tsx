import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { isFavouritePath, normalizeFavouritePath, normalizeFavouritePaths, toggleFavouritePath } from "../domain/favourites/favourites";

const STORAGE_KEY = "ambuassist.favourites.v1";

type FavouritesContextValue = {
  favourites: string[];
  isFavourite: (path: string) => boolean;
  toggleFavourite: (path: string) => void;
};

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadedRef = useRef(false);
  const pendingTogglesRef = useRef<string[]>([]);

  useEffect(() => {
    let active = true;
    async function loadFavourites() {
      let storedFavourites: string[] = [];
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) storedFavourites = normalizeFavouritePaths(JSON.parse(stored));
      } catch {}

      if (!active) return;
      for (const path of pendingTogglesRef.current) {
        storedFavourites = toggleFavouritePath(storedFavourites, path);
      }
      pendingTogglesRef.current = [];
      loadedRef.current = true;
      setFavourites(storedFavourites);
      setHasLoaded(true);
    }
    loadFavourites();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favourites)).catch(() => {});
  }, [favourites, hasLoaded]);

  const isFavourite = useCallback((path: string) => isFavouritePath(favourites, path), [favourites]);
  const toggleFavourite = useCallback((path: string) => {
    const normalizedPath = normalizeFavouritePath(path);
    if (!normalizedPath) return;
    if (!loadedRef.current) pendingTogglesRef.current.push(normalizedPath);
    setFavourites((current) => toggleFavouritePath(current, normalizedPath));
  }, []);
  const value = useMemo(() => ({ favourites, isFavourite, toggleFavourite }), [favourites, isFavourite, toggleFavourite]);

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites(): FavouritesContextValue {
  const value = useContext(FavouritesContext);
  if (!value) throw new Error("useFavourites must be used within FavouritesProvider");
  return value;
}
