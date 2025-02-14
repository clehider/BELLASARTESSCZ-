import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Alert, CircularProgress } from '@mui/material';
import TransactionForm from '../components/CashRegister/TransactionForm';
import CashRegisterSummary from '../components/CashRegister/CashRegisterSummary';
import CashRegisterTransactions from '../components/CashRegister/CashRegisterTransactions';
import { db, auth } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp
} from 'firebase/firestore';

const CashRegister = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    currentBalance: 0,
    dailyIncome: 0,
    dailyExpenses: 0,
    dailyBalance: 0,
    dailyTransactions: 0,
    lastOpening: '-',
    lastClosing: '-'
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar transacciones recientes
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', Timestamp.fromDate(today)),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(transactionsQuery);
      const transactionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setTransactions(transactionsData);

      // Calcular resumen
      const dailyStats = transactionsData.reduce((acc, curr) => {
        if (curr.type === 'income') {
          acc.dailyIncome += curr.amount;
        } else {
          acc.dailyExpenses += curr.amount;
        }
        return acc;
      }, { dailyIncome: 0, dailyExpenses: 0 });

      setSummary(prev => ({
        ...prev,
        ...dailyStats,
        dailyBalance: dailyStats.dailyIncome - dailyStats.dailyExpenses,
        dailyTransactions: transactionsData.length,
        currentBalance: dailyStats.dailyIncome - dailyStats.dailyExpenses,
        lastOpening: formatDateTime(today),
        lastClosing: formatDateTime(new Date())
      }));

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadCategories = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, 'expenseCategories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSubmitTransaction = async (transactionData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user authenticated');

      const transactionWithMeta = {
        ...transactionData,
        userId: user.uid,
        timestamp: Timestamp.fromDate(transactionData.timestamp),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      if (editingTransaction) {
        // Actualizar transacción existente
        const { id, ...updateData } = transactionWithMeta;
        await updateDoc(doc(db, 'transactions', editingTransaction.id), updateData);
      } else {
        // Crear nueva transacción
        await addDoc(collection(db, 'transactions'), transactionWithMeta);
      }

      setEditingTransaction(null);
      await loadData();
    } catch (err) {
      console.error('Error submitting transaction:', err);
      setError('Error al guardar la transacción');
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('¿Está seguro de eliminar esta transacción?')) return;

    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
      await loadData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Error al eliminar la transacción');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CashRegisterSummary summary={summary} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TransactionForm
            onSubmit={handleSubmitTransaction}
            currentBalance={summary.currentBalance}
            editingTransaction={editingTransaction}
            categories={categories}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CashRegisterTransactions
            transactions={transactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default CashRegister;
