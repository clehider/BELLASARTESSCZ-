import { deleteDoc, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';

export const eliminarCalificacion = async (calificacionId, estudianteId, materiaId) => {
  try {
    // Eliminar la calificación
    await deleteDoc(doc(db, 'calificaciones', calificacionId));

    // Actualizar referencias en estudiante
    const estudianteRef = doc(db, 'estudiantes', estudianteId);
    await updateDoc(estudianteRef, {
      calificaciones: arrayRemove(calificacionId)
    });

    // Actualizar referencias en materia
    const materiaRef = doc(db, 'materias', materiaId);
    await updateDoc(materiaRef, {
      calificaciones: arrayRemove(calificacionId)
    });

    return true;
  } catch (error) {
    console.error('Error al eliminar calificación:', error);
    return false;
  }
};
