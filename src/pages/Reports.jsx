import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');

      const start = new Date(dateRange.startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);

      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', Timestamp.fromDate(start)),
        where('timestamp', '<=', Timestamp.fromDate(end))
      );

      const querySnapshot = await getDocs(transactionsQuery);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Procesar datos para el reporte
      const summary = {
        totalIncome: 0,
        totalExpenses: 0,
        transactionCount: transactions.length,
        categories: {},
        dailyTotals: {},
      };

      transactions.forEach(transaction => {
        const amount = transaction.amount;
        const date = new Date(transaction.timestamp.seconds * 1000).toISOString().split('T')[0];
        
        // Actualizar totales
        if (transaction.type === 'income') {
          summary.totalIncome += amount;
        } else {
          summary.totalExpenses += amount;
        }

        // Actualizar categorías
        const category = transaction.category || 'Sin categoría';
        if (!summary.categories[category]) {
          summary.categories[category] = {
            income: 0,
            expenses: 0,
            count: 0
          };
        }
        summary.categories[category][transaction.type] += amount;
        summary.categories[category].count++;

        // Actualizar totales diarios
        if (!summary.dailyTotals[date]) {
          summary.dailyTotals[date] = {
            income: 0,
            expenses: 0,
            count: 0
          };
        }
        summary.dailyTotals[date][transaction.type] += amount;
        summary.dailyTotals[date].count++;
      });

      setReportData(summary);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generar Reporte
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Reporte</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Tipo de Reporte"
              >
                <MenuItem value="daily">Diario</MenuItem>
                <MenuItem value="weekly">Semanal</MenuItem>
                <MenuItem value="monthly">Mensual</MenuItem>
                <MenuItem value="custom">Personalizado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Fecha Inicial"
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Fecha Final"
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={generateReport}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generar'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {reportData && (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumen General
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Ingresos Totales</Typography>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(reportData.totalIncome)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Egresos Totales</Typography>
                <Typography variant="h4" color="error.main">
                  {formatCurrency(reportData.totalExpenses)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Balance</Typography>
                <Typography
                  variant="h4"
                  color={reportData.totalIncome - reportData.totalExpenses >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(reportData.totalIncome - reportData.totalExpenses)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Por Categoría
                </Typography>
                {Object.entries(reportData.categories).map(([category, data]) => (
                  <Paper key={category} sx={{ p: 1, mb: 1 }} variant="outlined">
                    <Typography variant="subtitle1">{category}</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography color="success.main">
                          {formatCurrency(data.income)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography color="error.main">
                          {formatCurrency(data.expenses)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography>
                          ({data.count} trans.)
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Por Día
                </Typography>
                {Object.entries(reportData.dailyTotals)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([date, data]) => (
                    <Paper key={date} sx={{ p: 1, mb: 1 }} variant="outlined">
                      <Typography variant="subtitle1">{formatDate(date)}</Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Typography color="success.main">
                            {formatCurrency(data.income)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography color="error.main">
                            {formatCurrency(data.expenses)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography>
                            ({data.count} trans.)
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Reports;
