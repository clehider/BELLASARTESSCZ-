import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const ExpenseCategories = ({ categories, onAdd, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budgetLimit: '',
  });
  const [error, setError] = useState('');

  const handleOpen = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        budgetLimit: category.budgetLimit || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        budgetLimit: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      budgetLimit: '',
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        setError('El nombre de la categoría es requerido');
        return;
      }

      const categoryData = {
        name: formData.name,
        description: formData.description,
        budgetLimit: parseFloat(formData.budgetLimit) || 0,
      };

      if (editingCategory) {
        await onEdit(editingCategory.id, categoryData);
      } else {
        await onAdd(categoryData);
      }

      handleClose();
    } catch (err) {
      setError('Error al guardar la categoría');
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('¿Está seguro de eliminar esta categoría?')) {
      try {
        await onDelete(categoryId);
      } catch (err) {
        setError('Error al eliminar la categoría');
      }
    }
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs>
            <Typography variant="h6">
              Categorías de Gastos
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Nueva Categoría
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Límite Presupuestario</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell align="right">
                    ${category.budgetLimit?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(category)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(category.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Límite Presupuestario"
                name="budgetLimit"
                type="number"
                value={formData.budgetLimit}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExpenseCategories;
