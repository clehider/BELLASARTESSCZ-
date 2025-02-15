import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, School as SchoolIcon } from '@mui/icons-material';

const SeleccionarProfesorModal = ({ open, onClose, profesores, onSelectProfesor, loading }) => {
  const [busqueda, setBusqueda] = useState('');
  const [profesoresFiltrados, setProfesoresFiltrados] = useState([]);

  useEffect(() => {
    setProfesoresFiltrados(profesores);
  }, [profesores]);

  const handleSearch = (searchTerm) => {
    setBusqueda(searchTerm);
    const filtered = profesores.filter(profesor =>
      `${profesor.nombre} ${profesor.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profesor.ci.includes(searchTerm)
    );
    setProfesoresFiltrados(filtered);
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
          setProfesoresFiltrados(profesores);
        }
      }}
    >
      <DialogTitle>Seleccionar Profesor</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Buscar profesor"
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
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <CircularProgress />
          </div>
        ) : (
          <List sx={{ mt: 2 }}>
            {profesoresFiltrados.map((profesor) => (
              <ListItem
                key={profesor.id}
                button
                onClick={() => {
                  onSelectProfesor(profesor);
                  onClose();
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <SchoolIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${profesor.nombre} ${profesor.apellidos}`}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        CI: {profesor.ci}
                      </Typography>
                      {profesor.especialidad && ` - ${profesor.especialidad}`}
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
            {profesoresFiltrados.length === 0 && !loading && (
              <ListItem>
                <ListItemText primary="No se encontraron profesores" />
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SeleccionarProfesorModal;
