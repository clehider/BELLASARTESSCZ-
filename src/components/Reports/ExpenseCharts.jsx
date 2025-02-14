import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ExpenseCharts = ({ data }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Gastos por Categoría
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={data.categoryData}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Evolución Mensual de Gastos
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#8884d8"
                name="Gastos"
              />
              <Line
                type="monotone"
                dataKey="budget"
                stroke="#82ca9d"
                name="Presupuesto"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Comparativa por Categoría
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.categoryComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="actual" name="Gasto Actual" fill="#8884d8" />
              <Bar dataKey="budget" name="Presupuesto" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ExpenseCharts;
