import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const ExpenseForm = ({ categories, onSubmit, editingExpense = null }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExpense) {
      const expenseDate = new Date(editingExpense.date);
      setFormData({
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        description: editingExpense.description,
        date: expenseDate.toISOString().split('T')[0],
        time: expenseDate.toTimeString().split(' ')[0].slice(0, 5),
        notes: editingExpense.notes || ''
      });
    }
  }, [editingExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!formData.amount || !formData.category || !formData.description) {
        setError('Por favor complete todos los campos requeridos');
        return;
      }

      const [year, month, day] = formData.date.split('-');
      const [hours, minutes] = formData.time.split(':');
      const expenseDate = new Date(year, month - 1, day, hours, minutes);

      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        date: expenseDate,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Limpiar formulario si no estamos editando
      if (!editingExpense) {
        setFormData({
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].slice(0, 5),
          notes: ''
        });
      }
    } catch (err) {
      setError('Error al registrar el gasto');
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {editingExpense ? 'Editar Gasto' : 'Registrar Gasto'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Monto"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              InputProps={{
                inputProps: { min: 0, step: 0.01 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Categoría</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Categoría"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Fecha"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hora"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notas adicionales"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Agregar notas o comentarios adicionales..."
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
            >
              {editingExpense ? 'Guardar Cambios' : 'Registrar Gasto'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ExpenseForm;
