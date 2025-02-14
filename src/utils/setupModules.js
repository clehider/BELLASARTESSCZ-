import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase/config';

export const setupModules = async () => {
  try {
    // Primero verificamos si ya existen módulos
    const modulesQuery = query(collection(db, 'modulos'));
    const existingModules = await getDocs(modulesQuery);
    
    if (existingModules.empty) {
      // Si no hay módulos, los creamos
      const modulesToAdd = [
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
        }
      ];

      for (const module of modulesToAdd) {
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
