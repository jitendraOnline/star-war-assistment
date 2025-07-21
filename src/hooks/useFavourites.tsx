import type { CharacterListItem, CharacterProperties } from '../types/character.type';
import { useEffect, useState, useMemo } from 'react';

export const localStorageFavouriteKey = 'favourites';

function readFavourites(): Record<string, CharacterListItem> {
  const data = localStorage.getItem(localStorageFavouriteKey);
  try {
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function writeFavourites(favs: Record<string, CharacterListItem>) {
  localStorage.setItem(localStorageFavouriteKey, JSON.stringify(favs));
}

export function useFavourites(uid?: string, character?: CharacterProperties) {
  const [favourites, setFavourites] = useState<Record<string, CharacterListItem>>({});

  useEffect(() => {
    setFavourites(readFavourites());
  }, [uid]);

  const isFavourite = useMemo(() => {
    return !!(uid && favourites[uid]);
  }, [uid, favourites]);

  const toggleFavourite = () => {
    if (!uid || !character) return;
    const favs = readFavourites();
    if (favs[uid]) {
      delete favs[uid];
    } else {
      favs[uid] = {
        uid: uid,
        name: character.name,
        url: character.url,
        gender: character.gender,
        homeworld: character.homeworld,
        properties: character,
      };
    }
    writeFavourites(favs);
    setFavourites(favs);
  };

  return {
    isFavourite,
    toggleFavourite,
    favourites,
  };
}
