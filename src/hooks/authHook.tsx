import { auth } from '@/service/firebase';
import { useEffect, useState } from 'react';
function useAuthUser() {
  const [user, setUser] = useState(() => auth.currentUser);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  return { user, loading };
}
export default useAuthUser;
