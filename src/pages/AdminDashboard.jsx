import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import AdminNavbar from '../components/AdminNavbar';
import TeacherManagement from '../components/TeacherManagement';
import StudentManagement from '../components/StudentManagement';
import { db } from '../firebase/config';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
} from 'firebase/firestore';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState({
    teachers: [],
    students: [],
    courses: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener profesores
      const teachersSnapshot = await getDocs(collection(db, 'users'), where('role', '==', 'teacher'));
      const teachersData = teachersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener estudiantes
      const studentsSnapshot = await getDocs(collection(db, 'users'), where('role', '==', 'student'));
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener cursos
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setData({
        teachers: teachersData,
        students: studentsData,
        courses: coursesData,
      });
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  // Funciones para gestionar profesores
  const handleAddTeacher = async (teacherData) => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...teacherData,
        role: 'teacher',
        createdAt: new Date(),
      });
      
      setData(prev => ({
        ...prev,
        teachers: [...prev.teachers, { id: docRef.id, ...teacherData }]
      }));
      
      return docRef;
    } catch (error) {
      console.error('Error al añadir profesor:', error);
      throw error;
    }
  };

  const handleEditTeacher = async (teacherId, teacherData) => {
    try {
      const teacherRef = doc(db, 'users', teacherId);
      await updateDoc(teacherRef, {
        ...teacherData,
        updatedAt: new Date(),
      });
      
      setData(prev => ({
        ...prev,
        teachers: prev.teachers.map(teacher =>
          teacher.id === teacherId ? { ...teacher, ...teacherData } : teacher
        )
      }));
    } catch (error) {
      console.error('Error al editar profesor:', error);
      throw error;
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    try {
      await deleteDoc(doc(db, 'users', teacherId));
      
      setData(prev => ({
        ...prev,
        teachers: prev.teachers.filter(teacher => teacher.id !== teacherId)
      }));
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      throw error;
    }
  };

  // Funciones para gestionar estudiantes
  const handleAddStudent = async (studentData) => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...studentData,
        role: 'student',
        createdAt: new Date(),
      });
      
      setData(prev => ({
        ...prev,
        students: [...prev.students, { id: docRef.id, ...studentData }]
      }));
      
      return docRef;
    } catch (error) {
      console.error('Error al añadir estudiante:', error);
      throw error;
    }
  };

  const handleEditStudent = async (studentId, studentData) => {
    try {
      const studentRef = doc(db, 'users', studentId);
      await updateDoc(studentRef, {
        ...studentData,
        updatedAt: new Date(),
      });
      
      setData(prev => ({
        ...prev,
        students: prev.students.map(student =>
          student.id === studentId ? { ...student, ...studentData } : student
        )
      }));
    } catch (error) {
      console.error('Error al editar estudiante:', error);
      throw error;
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await deleteDoc(doc(db, 'users', studentId));
      
      setData(prev => ({
        ...prev,
        students: prev.students.filter(student => student.id !== studentId)
      }));
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      throw error;
    }
  };
  const handleEnrollStudent = async (studentId, courseIds) => {
    try {
      // Eliminar inscripciones anteriores
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const deletePromises = enrollmentsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Crear nuevas inscripciones
      const enrollPromises = courseIds.map(courseId =>
        addDoc(collection(db, 'enrollments'), {
          studentId,
          courseId,
          enrollmentDate: new Date(),
          status: 'active'
        })
      );
      await Promise.all(enrollPromises);

      // Actualizar estado local
      setData(prev => ({
        ...prev,
        students: prev.students.map(student =>
          student.id === studentId ? { ...student, courses: courseIds } : student
        )
      }));
    } catch (error) {
      console.error('Error al inscribir estudiante:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AdminNavbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
              >
                <Tab label="Gestión de Maestros" />
                <Tab label="Gestión de Estudiantes" />
              </Tabs>

              {tabValue === 0 && (
                <TeacherManagement
                  teachers={data.teachers}
                  onAdd={handleAddTeacher}
                  onEdit={handleEditTeacher}
                  onDelete={handleDeleteTeacher}
                />
              )}

              {tabValue === 1 && (
                <StudentManagement
                  students={data.students}
                  courses={data.courses}
                  onAdd={handleAddStudent}
                  onEdit={handleEditStudent}
                  onDelete={handleDeleteStudent}
                  onEnroll={handleEnrollStudent}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default AdminDashboard;
