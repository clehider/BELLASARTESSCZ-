import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

const createAdminUser = async () => {
  const auth = getAuth();
  const email = 'admin@bellasartes.edu';
  const password = 'admin123456';

  try {
    // Crear usuario en Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Crear documento en colección administradores
    await setDoc(doc(collection(db, 'administradores'), user.uid), {
      email: email,
      rol: 'admin',
      nombre: 'Administrador',
      apellidos: 'Principal',
      createdAt: new Date().toISOString()
    });

    console.log('Usuario administrador creado exitosamente');
    return true;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('El usuario ya existe');
      return true;
    }
    console.error('Error creando admin:', error);
    return false;
  }
};

export { createAdminUser };
