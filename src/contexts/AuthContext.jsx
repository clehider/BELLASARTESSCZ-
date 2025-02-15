import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Buscar en colección de administradores primero
      const adminsRef = collection(db, 'administradores');
      const adminQuery = query(adminsRef, where('email', '==', email));
      const adminSnapshot = await getDocs(adminQuery);

      if (!adminSnapshot.empty) {
        const adminData = {
          id: adminSnapshot.docs[0].id,
          ...adminSnapshot.docs[0].data()
        };
        setUserRole('admin');
        return { role: 'admin', data: adminData };
      }

      // Si no es admin, buscar en estudiantes
      const estudiantesRef = collection(db, 'estudiantes');
      const estudianteQuery = query(estudiantesRef, where('email', '==', email));
      const estudianteSnapshot = await getDocs(estudianteQuery);

      if (!estudianteSnapshot.empty) {
        const estudianteData = {
          id: estudianteSnapshot.docs[0].id,
          ...estudianteSnapshot.docs[0].data()
        };
        setUserRole('student');
        return { role: 'student', data: estudianteData };
      }

      throw new Error('Usuario no autorizado');
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUserRole(null);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const adminsRef = collection(db, 'administradores');
          const adminQuery = query(adminsRef, where('email', '==', user.email));
          const adminSnapshot = await getDocs(adminQuery);

          if (!adminSnapshot.empty) {
            setUserRole('admin');
          } else {
            const estudiantesRef = collection(db, 'estudiantes');
            const estudianteQuery = query(estudiantesRef, where('email', '==', user.email));
            const estudianteSnapshot = await getDocs(estudianteQuery);

            if (!estudianteSnapshot.empty) {
              setUserRole('student');
            }
          }
        } catch (error) {
          console.error('Error al verificar rol:', error);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
