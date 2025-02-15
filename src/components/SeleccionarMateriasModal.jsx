import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  InputAdornment,
  IconButton,
  Button,
  DialogActions,
  Box,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const SeleccionarMateriasModal = ({ 
  open, 
  onClose, 
  materias, 
  materiasSeleccionadas, 
  onSaveSelection,
  loading 
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [materiasFiltradas, setMateriasFiltradas] = useState([]);

  useEffect(() => {
    setSeleccionadas(materiasSeleccionadas || []);
    setMateriasFiltradas(materias);
  }, [materias, materiasSeleccionadas, open]);

  const handleSearch = (searchTerm) => {
    setBusqueda(searchTerm);
    const filtered = materias.filter(materia =>
      materia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materia.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setMateriasFiltradas(filtered);
  };

  const handleToggle = (materiaId) => {
    const currentIndex = seleccionadas.indexOf(materiaId);
    const newSeleccionadas = [...seleccionadas];

    if (currentIndex === -1) {
      newSeleccionadas.push(materiaId);
    } else {
      newSeleccionadas.splice(currentIndex, 1);
    }

    setSeleccionadas(newSeleccionadas);
  };

  const handleSave = () => {
    onSaveSelection(seleccionadas);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      TransitionProps={{
        onExited: () => {
          setBusqueda('');
          setMateriasFiltradas(materias);
        }
      }}
    >
      <DialogTitle>Seleccionar Materias</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Buscar materias"
          type="text"
          fullWidth
          variant="outlined"
          value={busqueda}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {materiasFiltradas.map((materia) => (
              <ListItem
                key={materia.id}
                dense
                button
                onClick={() => handleToggle(materia.id)}
              >
                <Checkbox
                  edge="start"
                  checked={seleccionadas.indexOf(materia.id) !== -1}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText 
                  primary={materia.nombre}
                  secondary={`Código: ${materia.codigo}`}
                />
              </ListItem>
            ))}
            {materiasFiltradas.length === 0 && (
              <ListItem>
                <ListItemText primary="No se encontraron materias" />
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Guardar Selección
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeleccionarMateriasModal;
