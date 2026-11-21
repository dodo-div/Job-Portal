import { createContext, useState, useContext } from 'react';
import { readSession, storeSession } from '../services/session';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  function login(data) {
    storeSession(data);
    setUser(data);
  }
  function logout() {
    storeSession(null);
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
