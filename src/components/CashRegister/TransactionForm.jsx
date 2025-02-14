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

const TransactionForm = ({ 
  onSubmit, 
  currentBalance = 0, 
  editingTransaction = null,
  categories = []
}) => {
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    reference: '',
    category: '',
    paymentMethod: 'cash',
    receipt: null
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      const date = new Date(editingTransaction.timestamp.seconds * 1000);
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount.toString(),
        description: editingTransaction.description,
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().split(' ')[0].slice(0, 5),
        reference: editingTransaction.reference || '',
        category: editingTransaction.category || '',
        paymentMethod: editingTransaction.paymentMethod || 'cash',
        receipt: editingTransaction.receipt || null
      });
    }
  }, [editingTransaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setFormData(prev => ({
        ...prev,
        receipt: file
      }));
    } else {
      setError('El archivo debe ser menor a 5MB');
    }
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

      // Crear objeto Date combinando fecha y hora
      const [year, month, day] = formData.date.split('-');
      const [hours, minutes] = formData.time.split(':');
      const timestamp = new Date(year, month - 1, day, hours, minutes);

      await onSubmit({
        ...formData,
        amount: amount,
        timestamp,
        id: editingTransaction?.id
      });

      // Limpiar formulario si no estamos editando
      if (!editingTransaction) {
        setFormData({
          type: 'income',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].slice(0, 5),
          reference: '',
          category: '',
          paymentMethod: 'cash',
          receipt: null
        });
      }
    } catch (err) {
      setError('Error al registrar la transacción');
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
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

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
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

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                label="Método de Pago"
              >
                <MenuItem value="cash">Efectivo</MenuItem>
                <MenuItem value="transfer">Transferencia</MenuItem>
                <MenuItem value="card">Tarjeta</MenuItem>
                <MenuItem value="check">Cheque</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              {formData.receipt ? 'Cambiar Comprobante' : 'Adjuntar Comprobante'}
              <input
                type="file"
                hidden
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </Button>
            {formData.receipt && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Archivo seleccionado: {
                  typeof formData.receipt === 'string' 
                    ? formData.receipt 
                    : formData.receipt.name
                }
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              color={formData.type === 'income' ? 'primary' : 'secondary'}
            >
              {editingTransaction 
                ? 'Guardar Cambios' 
                : formData.type === 'income' 
                  ? 'Registrar Ingreso' 
                  : 'Registrar Egreso'
              }
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TransactionForm;
