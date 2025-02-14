import React from 'react';
import {
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FilterList, GetApp } from '@mui/icons-material';

const ReportFilters = ({ filters, onFilterChange, onExport }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Fecha Inicio"
              value={filters.startDate}
              onChange={(newValue) => onFilterChange('startDate', newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Fecha Fin"
              value={filters.endDate}
              onChange={(newValue) => onFilterChange('endDate', newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
              label="Categoría"
            >
              <MenuItem value="">Todas</MenuItem>
              {filters.categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              label="Tipo"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="expense">Gastos</MenuItem>
              <MenuItem value="income">Ingresos</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<FilterList />}
              onClick={() => onFilterChange('apply', true)}
              fullWidth
            >
              Filtrar
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={onExport}
            >
              Exportar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReportFilters;
