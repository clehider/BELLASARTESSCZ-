import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import TeacherNavbar from '../components/TeacherNavbar';
import TeacherCoursesList from '../components/TeacherCoursesList';
import GradeManagement from '../components/GradeManagement';
import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const coursesQuery = query(
          collection(db, 'courses'),
          where('teacherId', '==', currentUser.uid)
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchTeacherData();
    }
  }, [currentUser]);

  const handleViewStudents = async (courseId) => {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('courseId', '==', courseId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const studentsData = [];

      for (const enrollDoc of enrollmentsSnapshot.docs) {
        const studentDoc = await getDocs(
          query(collection(db, 'users'), 
          where('id', '==', enrollDoc.data().studentId))
        );
        if (!studentDoc.empty) {
          studentsData.push({
            id: studentDoc.docs[0].id,
            ...studentDoc.docs[0].data(),
            enrollmentId: enrollDoc.id
          });
        }
      }

      setStudents(studentsData);
      setSelectedCourse(courseId);
      setTabValue(1);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    }
  };

  const handleSaveGrades = async (courseId, grades) => {
    try {
      for (const [studentId, grade] of Object.entries(grades)) {
        await addDoc(collection(db, 'grades'), {
          studentId,
          courseId,
          teacherId: currentUser.uid,
          grade: Number(grade),
          timestamp: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error al guardar calificaciones:', error);
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
      <TeacherNavbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Mis Cursos" />
                <Tab label="Gestionar Calificaciones" disabled={!selectedCourse} />
              </Tabs>

              <Box sx={{ mt: 2 }}>
                {tabValue === 0 && (
                  <TeacherCoursesList
                    courses={courses}
                    onViewStudents={handleViewStudents}
                    onManageGrades={(courseId) => {
                      setSelectedCourse(courseId);
                      setTabValue(1);
                    }}
                  />
                )}

                {tabValue === 1 && selectedCourse && (
                  <GradeManagement
                    students={students}
                    courseId={selectedCourse}
                    onSaveGrades={handleSaveGrades}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default TeacherDashboard;
