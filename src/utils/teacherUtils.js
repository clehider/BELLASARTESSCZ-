import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export const getTeacherCourses = async (teacherId) => {
  try {
    const coursesQuery = query(
      collection(db, 'courses'),
      where('teacherId', '==', teacherId)
    );
    const snapshot = await getDocs(coursesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    throw error;
  }
};

export const getCourseStudents = async (courseId) => {
  try {
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(enrollmentsQuery);
    
    const students = [];
    for (const doc of snapshot.docs) {
      const enrollment = doc.data();
      const studentDoc = await getDocs(
        query(collection(db, 'users'), 
        where('id', '==', enrollment.studentId))
      );
      if (!studentDoc.empty) {
        students.push({
          id: studentDoc.docs[0].id,
          ...studentDoc.docs[0].data(),
          enrollmentId: doc.id
        });
      }
    }
    
    return students;
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    throw error;
  }
};

export const saveGrades = async (courseId, teacherId, grades) => {
  try {
    const batch = [];
    
    for (const [studentId, grade] of Object.entries(grades)) {
      batch.push(
        addDoc(collection(db, 'grades'), {
          studentId,
          courseId,
          teacherId,
          grade: Number(grade),
          timestamp: serverTimestamp(),
        })
      );
    }
    
    await Promise.all(batch);
  } catch (error) {
    console.error('Error al
cat > src/utils/teacherUtils.js << 'EOL'
import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export const getTeacherCourses = async (teacherId) => {
  try {
    const coursesQuery = query(
      collection(db, 'courses'),
      where('teacherId', '==', teacherId)
    );
    const snapshot = await getDocs(coursesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    throw error;
  }
};

export const getCourseStudents = async (courseId) => {
  try {
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(enrollmentsQuery);
    
    const students = [];
    for (const doc of snapshot.docs) {
      const enrollment = doc.data();
      const studentDoc = await getDocs(
        query(collection(db, 'users'), 
        where('id', '==', enrollment.studentId))
      );
      if (!studentDoc.empty) {
        students.push({
          id: studentDoc.docs[0].id,
          ...studentDoc.docs[0].data(),
          enrollmentId: doc.id
        });
      }
    }
    
    return students;
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    throw error;
  }
};

export const saveGrades = async (courseId, teacherId, grades) => {
  try {
    const batch = [];
    
    for (const [studentId, grade] of Object.entries(grades)) {
      batch.push(
        addDoc(collection(db, 'grades'), {
          studentId,
          courseId,
          teacherId,
          grade: Number(grade),
          timestamp: serverTimestamp(),
        })
      );
    }
    
    await Promise.all(batch);
  } catch (error) {
    console.error('Error al guardar calificaciones:', error);
    throw error;
  }
};

export const getStudentGrades = async (courseId, studentId) => {
  try {
    const gradesQuery = query(
      collection(db, 'grades'),
      where('courseId', '==', courseId),
      where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(gradesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener calificaciones del estudiante:', error);
    throw error;
  }
};

export const updateCourseDetails = async (courseId, updates) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      ...updates,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar detalles del curso:', error);
    throw error;
  }
};

export const getTeacherStats = async (teacherId) => {
  try {
    const coursesQuery = query(
      collection(db, 'courses'),
      where('teacherId', '==', teacherId)
    );
    const coursesSnapshot = await getDocs(coursesQuery);
    
    let totalStudents = 0;
    let totalGrades = 0;
    const courseStats = [];

    for (const courseDoc of coursesSnapshot.docs) {
      const courseId = courseDoc.id;
      
      // Obtener estudiantes del curso
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('courseId', '==', courseId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const studentCount = enrollmentsSnapshot.size;
      
      // Obtener calificaciones del curso
      const gradesQuery = query(
        collection(db, 'grades'),
        where('courseId', '==', courseId)
      );
      const gradesSnapshot = await getDocs(gradesQuery);
      const gradeCount = gradesSnapshot.size;
      
      totalStudents += studentCount;
      totalGrades += gradeCount;
      
      courseStats.push({
        courseId,
        courseName: courseDoc.data().name,
        studentCount,
        gradeCount,
        averageGrade: gradeCount > 0 
          ? gradesSnapshot.docs.reduce((acc, doc) => acc + doc.data().grade, 0) / gradeCount 
          : 0
      });
    }
    
    return {
      totalCourses: coursesSnapshot.size,
      totalStudents,
      totalGrades,
      courseStats
    };
  } catch (error) {
    console.error('Error al obtener estadísticas del profesor:', error);
    throw error;
  }
};
