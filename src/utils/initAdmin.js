import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const initializeAdmin = async () => {
  const adminEmail = 'admin@bellasartes.edu';
  const adminPassword = 'admin123456';

  try {
    const auth = getAuth();
    
    // Verificar si el administrador ya existe en Firestore
    const adminRef = collection(db, 'administradores');
    const q = query(adminRef, where('email', '==', adminEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      
      // Crear documento en la colección de administradores
      await addDoc(collection(db, 'administradores'), {
        email: adminEmail,
        nombre: 'Administrador',
        apellidos: 'Principal',
        rol: 'admin',
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        uid: userCredential.user.uid
      });

      console.log('Administrador creado exitosamente');
      return true;
    } else {
      console.log('El administrador ya existe');
      return false;
    }
  } catch (error) {
    console.error('Error al crear administrador:', error);
    return false;
  }
};

export default initializeAdmin;
