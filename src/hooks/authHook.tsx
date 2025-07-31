import { auth } from '@/service/firebase';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

function useAuthUser() {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: User | null) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  return { user, loading };
}
export default useAuthUser;
