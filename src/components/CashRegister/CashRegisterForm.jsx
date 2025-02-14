import React, { useState } from 'react';
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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const CashRegisterForm = ({ onSubmit, currentBalance = 0 }) => {
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    date: new Date(),
    reference: '',
    category: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!formData.amount || !formData.description) {
        setError('Por favor complete todos los campos requeridos');
        return;
      }

      const amount = parseFloat(formData.amount);
      if (formData.type === 'expense' && amount > currentBalance) {
        setError('Saldo insuficiente para realizar este egreso');
        return;
      }

      await onSubmit({
        ...formData,
        amount: amount,
        timestamp: formData.date,
      });

      // Limpiar formulario
      setFormData({
        type: 'income',
        amount: '',
        description: '',
        date: new Date(),
        reference: '',
        category: '',
      });
    } catch (err) {
      setError('Error al registrar la transacción');
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Registrar Transacción
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Tipo"
              >
                <MenuItem value="income">Ingreso</MenuItem>
                <MenuItem value="expense">Egreso</MenuItem>
              </Select>
            </FormControl>
          </Grid>

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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Fecha y Hora"
                value={formData.date}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Referencia"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Número de factura, recibo, etc."
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              color={formData.type === 'income' ? 'primary' : 'secondary'}
            >
              {formData.type === 'income' ? 'Registrar Ingreso' : 'Registrar Egreso'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CashRegisterForm;
