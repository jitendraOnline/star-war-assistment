import type { CharacterListItem } from '../types/character.type';
import { useEffect, useState } from 'react';

export function useFavourites(uid?: string, character?: CharacterListItem) {
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const favs = localStorage.getItem('favourites');
    if (favs) {
      const parsed = JSON.parse(favs) as Record<string, CharacterListItem>;
      setIsFavourite(!!parsed[uid]);
    }
  }, [uid]);

  const toggleFavourite = () => {
    if (!uid || !character) return;
    const favs = localStorage.getItem('favourites');
    const parsed = favs ? (JSON.parse(favs) as Record<string, CharacterListItem>) : {};

    if (parsed[uid]) {
      delete parsed[uid];
      setIsFavourite(false);
    } else {
      parsed[uid] = character;
      setIsFavourite(true);
    }

    localStorage.setItem('favourites', JSON.stringify(parsed));
  };

  return {
    isFavourite,
    toggleFavourite,
  };
}
