import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function login(email, password) {
    try {
      console.log('AuthContext: Iniciando login con:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Login exitoso, obteniendo token...');
      
      // Forzar actualización del token
      await userCredential.user.getIdToken(true);
      
      // Obtener claims actualizados
      const idTokenResult = await userCredential.user.getIdTokenResult();
      console.log('AuthContext: Claims del usuario:', idTokenResult.claims);

      // Verificar documento en Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        console.error('AuthContext: No se encontró el documento del usuario en Firestore');
        throw new Error('Usuario no configurado correctamente');
      }

      console.log('AuthContext: Login completado exitosamente');
      return userCredential;
    } catch (error) {
      console.error('AuthContext: Error en login:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
      console.log('AuthContext: Logout exitoso');
    } catch (error) {
      console.error('AuthContext: Error en logout:', error);
      throw error;
    }
  }

  useEffect(() => {
    console.log('AuthContext: Configurando listener de auth state');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: Auth state changed:', user ? user.email : 'No user');
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          console.log('AuthContext: Claims actualizados:', idTokenResult.claims);
        } catch (error) {
          console.error('AuthContext: Error al obtener claims:', error);
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
