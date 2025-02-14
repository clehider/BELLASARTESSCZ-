import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import StudentNavbar from '../components/StudentNavbar';
import GradesTable from '../components/GradesTable';
import SubjectsList from '../components/SubjectsList';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState({
    grades: [],
    subjects: [],
    profile: null,
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Obtener perfil del estudiante
        const profileDoc = await getDocs(
          query(collection(db, 'users'), where('email', '==', currentUser.email))
        );
        const profile = profileDoc.docs[0].data();

        // Obtener materias inscritas
        const subjectsQuery = query(
          collection(db, 'enrollments'),
          where('studentId', '==', currentUser.uid)
        );
        const subjectsSnapshot = await getDocs(subjectsQuery);
        const subjects = [];

        for (const doc of subjectsSnapshot.docs) {
          const subjectData = doc.data();
          const subjectDoc = await getDocs(
            query(collection(db, 'subjects'), where('id', '==', subjectData.subjectId))
          );
          if (!subjectDoc.empty) {
            subjects.push({
              id: doc.id,
              ...subjectData,
              ...subjectDoc.docs[0].data(),
            });
          }
        }

        // Obtener calificaciones
        const gradesQuery = query(
          collection(db, 'grades'),
          where('studentId', '==', currentUser.uid)
        );
        const gradesSnapshot = await getDocs(gradesQuery);
        const grades = gradesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStudentData({
          profile,
          subjects,
          grades,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchStudentData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <StudentNavbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" gutterBottom>
                Bienvenido, {studentData.profile?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                CI: {studentData.profile?.ci}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <GradesTable grades={studentData.grades} />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <SubjectsList subjects={studentData.subjects} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default StudentDashboard;
