import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';

export const getStudentGrades = async (studentId) => {
  try {
    const gradesQuery = query(
      collection(db, 'grades'),
      where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(gradesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    throw error;
  }
};

export const getStudentSubjects = async (studentId) => {
  try {
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(enrollmentsQuery);
    
    const subjects = [];
    for (const doc of snapshot.docs) {
      const enrollment = doc.data();
      const subjectDoc = await getDoc(doc(db, 'subjects', enrollment.subjectId));
      if (subjectDoc.exists()) {
        subjects.push({
          id: subjectDoc.id,
          ...subjectDoc.data(),
          enrollmentId: doc.id,
          enrollmentStatus: enrollment.status,
        });
      }
    }
    
    return subjects;
  } catch (error) {
    console.error('Error al obtener materias:', error);
    throw error;
  }
};

export const getStudentProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener perfil del estudiante:', error);
    throw error;
  }
};
