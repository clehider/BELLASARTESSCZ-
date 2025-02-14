import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
} from '@mui/material';
import {
  Receipt,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const CashRegisterTransactions = ({ transactions, onDelete, onEdit, onViewReceipt }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Transacciones Recientes
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Referencia</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {formatDate(transaction.timestamp)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.type === 'income' ? 'Ingreso' : 'Egreso'}
                    color={transaction.type === 'income' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell align="right">
                  <Typography
                    color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                  >
                    ${transaction.amount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>{transaction.reference || '-'}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {transaction.receipt && (
                      <IconButton
                        size="small"
                        onClick={() => onViewReceipt(transaction)}
                      >
                        <Receipt />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => onEdit(transaction)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(transaction.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CashRegisterTransactions;
