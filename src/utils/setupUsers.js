import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const users = [
  {
    email: 'admin@test.com',
    password: '123456',
    rol: 'admin',
    nombre: 'Administrador'
  },
  {
    email: 'profesor@test.com',
    password: '123456',
    rol: 'profesor',
    nombre: 'Profesor Test'
  },
  {
    email: 'estudiante@test.com',
    password: '123456',
    rol: 'estudiante',
    nombre: 'Estudiante Test'
  }
];

export const setupUsers = async () => {
  try {
    for (const user of users) {
      try {
        // Crear usuario en Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );

        // Guardar información adicional en Firestore
        await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
          email: user.email,
          rol: user.rol,
          nombre: user.nombre
        });

        console.log(`Usuario creado exitosamente: ${user.email}`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`Usuario ya existe: ${user.email}`);
        } else {
          console.error(`Error creando usuario ${user.email}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error en setupUsers:', error);
  }
};
