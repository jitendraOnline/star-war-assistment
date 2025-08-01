import { database } from '@/service/firebase';
import { ref, onValue, push, remove, update, DataSnapshot, off } from 'firebase/database';

export interface Person {
  id: string;
  name: string;
  balance: number;
  cityId: string;
  aadhaar?: string;
  petName?: string;
  gender?: 'male' | 'female' | 'other';
}

export function subscribeToPeople(
  userId: string,
  onData: (people: Person[]) => void,
  onError: (error: Error) => void
) {
  const peopleRef = ref(database, `users/${userId}/people`);

  const handleSnapshot = (snapshot: DataSnapshot) => {
    try {
      const data = snapshot.val();
      if (data) {
        const people = Object.entries(data).map(([id, value]) => ({
          id,
          name: (value as Record<string, unknown>).name as string,
          balance: (value as Record<string, unknown>).balance as number,
          cityId: (value as Record<string, unknown>).cityId as string,
          aadhaar: ((value as Record<string, unknown>).aadhaar as string) || '',
          petName: ((value as Record<string, unknown>).petName as string) || '',
          gender:
            ((value as Record<string, unknown>).gender as 'male' | 'female' | 'other') || 'male',
        }));
        onData(people);
      } else {
        onData([]);
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  const handleError = (error: Error) => {
    onError(error);
  };

  onValue(peopleRef, handleSnapshot, handleError);

  // Return unsubscribe function
  return () => {
    off(peopleRef, 'value', handleSnapshot);
  };
}

export async function addPerson(userId: string, person: Omit<Person, 'id'>) {
  await push(ref(database, `users/${userId}/people`), person);
}

export async function updatePerson(userId: string, id: string, person: Omit<Person, 'id'>) {
  await update(ref(database, `users/${userId}/people/${id}`), person);
}

export async function deletePerson(userId: string, id: string) {
  await remove(ref(database, `users/${userId}/people/${id}`));
}
