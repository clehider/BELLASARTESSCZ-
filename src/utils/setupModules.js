import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase/config';

const modules = [
  {
    nombre: "Dashboard",
    path: "/dashboard",
    icon: "Dashboard",
    roles: ["admin", "profesor", "estudiante"],
    orden: 1
  },
  {
    nombre: "Materias",
    path: "/materias",
    icon: "LibraryBooks",
    roles: ["admin", "profesor"],
    orden: 2
  },
  {
    nombre: "Estudiantes",
    path: "/estudiantes",
    icon: "School",
    roles: ["admin", "profesor"],
    orden: 3
  },
  {
    nombre: "Profesores",
    path: "/profesores",
    icon: "Person",
    roles: ["admin"],
    orden: 4
  },
  {
    nombre: "Calificaciones",
    path: "/calificaciones",
    icon: "Assignment",
    roles: ["profesor", "estudiante"],
    orden: 5
  }
];

export const setupModules = async () => {
  try {
    // Verificar si ya existen módulos
    const modulesRef = collection(db, 'modulos');
    const modulesSnapshot = await getDocs(query(modulesRef));

    if (modulesSnapshot.empty) {
      // Si no hay módulos, los creamos
      for (const module of modules) {
        await addDoc(collection(db, 'modulos'), module);
      }
      console.log('Módulos creados exitosamente');
    } else {
      console.log('Los módulos ya existen');
    }
  } catch (error) {
    console.error('Error al configurar módulos:', error);
  }
};
