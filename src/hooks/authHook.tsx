import { auth } from '@/service/firebase';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
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

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return { user, loading, logout };
}
export default useAuthUser;
