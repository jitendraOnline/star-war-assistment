import { database } from '@/service/firebase';
import { ref, onValue, push, remove, DataSnapshot } from 'firebase/database';

export interface City {
  id: string;
  name: string;
}

export function subscribeToCities(
  onData: (cities: City[]) => void,
  onError: (error: Error) => void
) {
  const citiesRef = ref(database, 'cities');
  const unsubscribe = onValue(
    citiesRef,
    (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        onData(
          Object.entries(data).map(([id, value]: [string, unknown]) => ({
            id,
            name: (value as { name: string }).name,
          }))
        );
      } else {
        onData([]);
      }
    },
    (err) => {
      onError(err);
    }
  );
  return unsubscribe;
}

export async function addCity(name: string) {
  await push(ref(database, 'cities'), { name });
}

export async function deleteCity(id: string) {
  await remove(ref(database, `cities/${id}`));
}
