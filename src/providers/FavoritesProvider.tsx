
import React, { createContext, useContext, useState, useEffect } from "react";

type FavoritesContextType = {
  favorites: string[];
  addFavorite: (articleNumber: string) => void;
  removeFavorite: (articleNumber: string) => void;
  isFavorite: (articleNumber: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Load favorites from localStorage on component mount
    const savedFavorites = localStorage.getItem("vadmeconFavorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const saveFavorites = (newFavorites: string[]) => {
    localStorage.setItem("vadmeconFavorites", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const addFavorite = (articleNumber: string) => {
    if (!favorites.includes(articleNumber)) {
      const newFavorites = [...favorites, articleNumber];
      saveFavorites(newFavorites);
    }
  };

  const removeFavorite = (articleNumber: string) => {
    const newFavorites = favorites.filter((num) => num !== articleNumber);
    saveFavorites(newFavorites);
  };

  const isFavorite = (articleNumber: string) => {
    return favorites.includes(articleNumber);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
