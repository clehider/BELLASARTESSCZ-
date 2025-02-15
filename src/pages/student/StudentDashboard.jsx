import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF'
  },
  section: {
    margin: 10,
    padding: 10
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center'
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  text: {
    fontSize: 12,
    marginBottom: 5
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginVertical: 10
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableCell: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    fontSize: 10
  },
  headerCell: {
    backgroundColor: '#f0f0f0'
  }
});

// Componente PDF
const BoletaCalificaciones = ({ studentData, materias, calificaciones }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Boleta de Calificaciones</Text>
        <Text style={styles.title}>Datos del Estudiante:</Text>
        <Text style={styles.text}>Nombre: {studentData?.nombre} {studentData?.apellidos}</Text>
        <Text style={styles.text}>CI: {studentData?.ci}</Text>
        <Text style={styles.text}>Email: {studentData?.email}</Text>

        <View style={[styles.section, styles.table]}>
          <View style={[styles.tableRow, styles.headerCell]}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Materia</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>Código</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>Periodo</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>Calificación</Text>
          </View>
          {materias.map((materia, index) => {
            const calificacionesMateria = calificaciones.filter(c => c.materia_id === materia.id);
            return calificacionesMateria.map((cal, calIndex) => (
              <View key={`${index}-${calIndex}`} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{materia.nombre}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{materia.codigo}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{cal.periodo}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{cal.calificacion}</Text>
              </View>
            ));
          })}
        </View>

        <Text style={[styles.text, { marginTop: 20, fontSize: 10 }]}>
          Documento generado el: {new Date().toLocaleDateString()}
        </Text>
      </View>
    </Page>
  </Document>
);

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser) return;

      try {
        // Obtener datos del estudiante
        const estudiantesRef = collection(db, 'estudiantes');
        const q = query(estudiantesRef, where('email', '==', currentUser.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0];
          const student = { id: studentDoc.id, ...studentDoc.data() };
          setStudentData(student);

          // Obtener calificaciones del estudiante
          const calificacionesRef = collection(db, 'calificaciones');
          const calificacionesQuery = query(calificacionesRef, where('estudiante_id', '==', student.id));
          const calificacionesSnapshot = await getDocs(calificacionesQuery);
          
          const calificacionesData = [];
          const materiasIds = new Set();

          calificacionesSnapshot.forEach(doc => {
            const calificacion = { id: doc.id, ...doc.data() };
            materiasIds.add(calificacion.materia_id);
            calificacionesData.push(calificacion);
          });

          setCalificaciones(calificacionesData);

          // Obtener materias
          const materiasRef = collection(db, 'materias');
          const materiasSnapshot = await getDocs(materiasRef);
          const materiasData = materiasSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).filter(materia => materiasIds.has(materia.id));

          setMaterias(materiasData);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [currentUser]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!studentData) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          No se encontraron datos del estudiante
        </Typography>
      </Container>
    );
  }

  const calcularPromedio = (calificacionesMateria) => {
    if (calificacionesMateria.length === 0) return 'N/A';
    const suma = calificacionesMateria.reduce((acc, cal) => acc + cal.calificacion, 0);
    return (suma / calificacionesMateria.length).toFixed(2);
  };

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bienvenido, {studentData.nombre} {studentData.apellidos}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Información Personal
              </Typography>
              <Typography>CI: {studentData.ci}</Typography>
              <Typography>Email: {studentData.email}</Typography>
              {studentData.telefono && (
                <Typography>Teléfono: {studentData.telefono}</Typography>
              )}
              
              <Box sx={{ mt: 2 }}>
                <PDFDownloadLink
                  document={
                    <BoletaCalificaciones 
                      studentData={studentData}
                      materias={materias}
                      calificaciones={calificaciones}
                    />
                  }
                  fileName={`boleta_calificaciones_${studentData.ci}.pdf`}
                >
                  {({ blob, url, loading, error }) => 
                    <Button
                      variant="contained"
                      disabled={loading}
                      startIcon={<AssignmentIcon />}
                    >
                      {loading ? 'Generando PDF...' : 'Descargar Boleta'}
                    </Button>
                  }
                </PDFDownloadLink>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Materias y Calificaciones
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Materia</TableCell>
                      <TableCell>Código</TableCell>
                      <TableCell>Periodo</TableCell>
                      <TableCell>Calificación</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {materias.map((materia) => {
                      const calificacionesMateria = calificaciones.filter(
                        c => c.materia_id === materia.id
                      );
                      const promedio = calcularPromedio(calificacionesMateria);

                      return calificacionesMateria.map((cal, index) => (
                        <TableRow key={`${materia.id}-${index}`}>
                          <TableCell>{materia.nombre}</TableCell>
                          <TableCell>{materia.codigo}</TableCell>
                          <TableCell>{cal.periodo}</TableCell>
                          <TableCell>{cal.calificacion}</TableCell>
                          <TableCell>
                            <Chip
                              icon={<GradeIcon />}
                              label={cal.calificacion >= 51 ? "Aprobado" : "Reprobado"}
                              color={cal.calificacion >= 51 ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ));
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Resumen de Materias
                </Typography>
                <Grid container spacing={2}>
                  {materias.map((materia) => {
                    const calificacionesMateria = calificaciones.filter(
                      c => c.materia_id === materia.id
                    );
                    const promedio = calcularPromedio(calificacionesMateria);

                    return (
                      <Grid item xs={12} sm={6} md={4} key={materia.id}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              {materia.nombre}
                            </Typography>
                            <Typography color="textSecondary" gutterBottom>
                              Código: {materia.codigo}
                            </Typography>
                            <Chip
                              icon={<SchoolIcon />}
                              label={`Promedio: ${promedio}`}
                              color={promedio >= 51 ? "success" : "error"}
                              size="small"
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default StudentDashboard;
