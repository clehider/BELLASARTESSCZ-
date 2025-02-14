import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generatePDFReport = (reportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Título
  doc.setFontSize(18);
  doc.text('Reporte de Gastos', pageWidth / 2, 15, { align: 'center' });

  // Información General
  doc.setFontSize(12);
  doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, 15, 25);
  doc.text(`Total de Gastos: $${reportData.metrics.totalExpenses.toFixed(2)}`, 15, 32);

  // Métricas Clave
  doc.setFontSize(14);
  doc.text('Métricas Principales', 15, 45);
  
  const metricsData = [
    ['Promedio Mensual', `$${reportData.metrics.monthlyAverage.toFixed(2)}`],
    ['Gasto Máximo', `$${reportData.metrics.maxExpense.toFixed(2)}`],
    ['Presupuesto Disponible', `$${reportData.metrics.availableBudget.toFixed(2)}`],
    ['Utilización del Presupuesto', `${reportData.metrics.budgetUtilization.toFixed(2)}%`],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Métrica', 'Valor']],
    body: metricsData,
  });

  // Gastos por Categoría
  doc.setFontSize(14);
  doc.text('Gastos por Categoría', 15, doc.lastAutoTable.finalY + 15);

  const categoryData = reportData.chartData.categoryData.map(cat => [
    cat.name,
    `$${cat.amount.toFixed(2)}`,
    `${cat.percentage.toFixed(2)}%`,
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Categoría', 'Monto', 'Porcentaje']],
    body: categoryData,
  });

  // Evolución Mensual
  doc.setFontSize(14);
  doc.text('Evolución Mensual', 15, doc.lastAutoTable.finalY + 15);

  const monthlyData = reportData.chartData.monthlyData.map(month => [
    month.month,
    `$${month.expenses.toFixed(2)}`,
    `$${month.budget.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Mes', 'Gastos', 'Presupuesto']],
    body: monthlyData,
  });

  // Pie de página
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc;
};

export const formatReportData = (data) => {
  return {
    metrics: {
      totalExpenses: data.metrics.totalExpenses || 0,
      monthlyAverage: data.metrics.monthlyAverage || 0,
      maxExpense: data.metrics.maxExpense || 0,
      availableBudget: data.metrics.availableBudget || 0,
      budgetUtilization: data.metrics.budgetUtilization || 0,
    },
    chartData: {
      categoryData: data.chartData.categoryData || [],
      monthlyData: data.chartData.monthlyData || [],
      categoryComparison: data.chartData.categoryComparison || [],
    },
  };
};

export const generateCSVReport = (data) => {
  const rows = [
    ['Reporte de Gastos'],
    ['Fecha', format(new Date(), 'dd/MM/yyyy')],
    [''],
    ['Métricas Principales'],
    ['Total de Gastos', `$${data.metrics.totalExpenses.toFixed(2)}`],
    ['Promedio Mensual', `$${data.metrics.monthlyAverage.toFixed(2)}`],
    ['Gasto Máximo', `$${data.metrics.maxExpense.toFixed(2)}`],
    ['Presupuesto Disponible', `$${data.metrics.availableBudget.toFixed(2)}`],
    [''],
    ['Gastos por Categoría'],
    ['Categoría', 'Monto', 'Porcentaje'],
    ...data.chartData.categoryData.map(cat => [
      cat.name,
      `$${cat.amount.toFixed(2)}`,
      `${cat.percentage.toFixed(2)}%`,
    ]),
    [''],
    ['Evolución Mensual'],
    ['Mes', 'Gastos', 'Presupuesto'],
    ...data.chartData.monthlyData.map(month => [
      month.month,
      `$${month.expenses.toFixed(2)}`,
      `$${month.budget.toFixed(2)}`,
    ]),
  ];

  return rows.map(row => row.join(',')).join('\n');
};
