import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser) => {
    try {
      const data = await api.getMe(firebaseUser.uid);
      setProfile(data.user);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) await fetchProfile(firebaseUser);
      else setProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const register = async (email, password, name, mode = 'dreamer') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const data = await api.register({ uid: cred.user.uid, email, name, mode });
    setProfile(data.user);
    return cred;
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await fetchProfile(cred.user);
    return cred;
  };

  const logout = () => { setProfile(null); return signOut(auth); };

  const refreshProfile = () => user && fetchProfile(user);

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
