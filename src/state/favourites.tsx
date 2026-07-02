import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { normalizeFavouritePaths, toggleFavouritePath } from "../domain/favourites/favourites";

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

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!active || stored === null) return;
        setFavourites(normalizeFavouritePaths(JSON.parse(stored)));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setHasLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favourites)).catch(() => {});
  }, [favourites, hasLoaded]);

  const isFavourite = useCallback((path: string) => favourites.includes(path), [favourites]);
  const toggleFavourite = useCallback((path: string) => {
    setFavourites((current) => toggleFavouritePath(current, path));
  }, []);
  const value = useMemo(() => ({ favourites, isFavourite, toggleFavourite }), [favourites, isFavourite, toggleFavourite]);

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites(): FavouritesContextValue {
  const value = useContext(FavouritesContext);
  if (!value) throw new Error("useFavourites must be used within FavouritesProvider");
  return value;
}
