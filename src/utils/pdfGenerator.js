import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateCashRegisterPDF = (registerData, transactions) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(20);
  doc.text('Reporte de Caja', 14, 20);

  // Información general
  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Balance Inicial: $${registerData.initialAmount}`, 14, 40);
  doc.text(`Balance Actual: $${registerData.currentBalance}`, 14, 50);

  // Tabla de transacciones
  const tableData = transactions.map(t => [
    new Date(t.createdAt.toDate()).toLocaleString(),
    t.type === 'income' ? 'Ingreso' : 'Egreso',
    t.description,
    `$${t.amount}`,
    t.category,
    t.createdByName
  ]);

  doc.autoTable({
    startY: 60,
    head: [['Fecha', 'Tipo', 'Descripción', 'Monto', 'Categoría', 'Usuario']],
    body: tableData,
  });

  return doc;
};

export const generateStudentReportPDF = (studentData, grades) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(20);
  doc.text('Reporte Académico', 14, 20);

  // Información del estudiante
  doc.setFontSize(12);
  doc.text(`Estudiante: ${studentData.name}`, 14, 30);
  doc.text(`CI: ${studentData.ci}`, 14, 40);

  // Tabla de calificaciones
  const tableData = grades.map(g => [
    g.subjectName,
    `${g.grade}`,
    g.teacherName,
    new Date(g.date.toDate()).toLocaleDateString()
  ]);

  doc.autoTable({
    startY: 50,
    head: [['Materia', 'Nota', 'Profesor', 'Fecha']],
    body: tableData,
  });

  return doc;
};

export const generateTeacherReportPDF = (teacherData, courses) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(20);
  doc.text('Reporte Docente', 14, 20);

  // Información del profesor
  doc.setFontSize(12);
  doc.text(`Profesor: ${teacherData.name}`, 14, 30);
  doc.text(`Especialidad: ${teacherData.speciality}`, 14, 40);

  // Tabla de cursos
  const tableData = courses.map(c => [
    c.name,
    c.studentCount.toString(),
    c.averageGrade ? c.averageGrade.toFixed(2) : 'N/A'
  ]);

  doc.autoTable({
    startY: 50,
    head: [['Curso', 'Estudiantes', 'Promedio']],
    body: tableData,
  });

  return doc;
};
