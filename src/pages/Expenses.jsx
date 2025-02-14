import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  CircularProgress,
  Alert,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import { db, storage } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import ExpenseCategories from '../components/Expenses/ExpenseCategories';
import ExpenseForm from '../components/Expenses/ExpenseForm';
import ExpenseSummary from '../components/Expenses/ExpenseSummary';

const Expenses = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    monthlyTotal: 0,
    monthlyBudget: 0,
    monthlyChange: 0,
    categoryBreakdown: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchExpenses(),
        calculateSummary(),
      ]);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos de gastos');
    } finally {
      setLoading(false);
    }
  };
  const fetchCategories = async () => {
    const categoriesSnapshot = await getDocs(collection(db, 'expenseCategories'));
    const categoriesData = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCategories(categoriesData);
    return categoriesData;
  };

  const fetchExpenses = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expensesQuery = query(
      collection(db, 'expenses'),
      where('date', '>=', startOfMonth)
    );
    const expensesSnapshot = await getDocs(expensesQuery);
    const expensesData = expensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setExpenses(expensesData);
    return expensesData;
  };

  const calculateSummary = async () => {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Obtener gastos del mes actual
    const currentMonthExpenses = expenses.filter(
      expense => new Date(expense.date.toDate()) >= startOfMonth
    );
    const currentMonthTotal = currentMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Obtener gastos del mes anterior
    const prevMonthQuery = query(
      collection(db, 'expenses'),
      where('date', '>=', startOfPrevMonth),
      where('date', '<=', endOfPrevMonth)
    );
    const prevMonthSnapshot = await getDocs(prevMonthQuery);
    const prevMonthTotal = prevMonthSnapshot.docs.reduce(
      (sum, doc) => sum + doc.data().amount,
      0
    );

    // Calcular cambio porcentual
    const monthlyChange = prevMonthTotal === 0 
      ? 100 
      : ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;

    // Calcular desglose por categoría
    const categoryBreakdown = categories.map(category => {
      const spent = currentMonthExpenses
        .filter(expense => expense.category === category.id)
        .reduce((sum, expense) => sum + expense.amount, 0);
      return {
        id: category.id,
        name: category.name,
        spent,
        limit: category.budgetLimit,
      };
    });

    const monthlyBudget = categories.reduce(
      (sum, category) => sum + Number(category.budgetLimit),
      0
    );

    setSummary({
      monthlyTotal: currentMonthTotal,
      monthlyBudget,
      monthlyChange,
      categoryBreakdown,
    });
  };

  const handleAddCategory = async (categoryData) => {
    try {
      const docRef = await addDoc(collection(db, 'expenseCategories'), {
        ...categoryData,
        createdAt: serverTimestamp(),
      });
      setCategories(prev => [...prev, { id: docRef.id, ...categoryData }]);
      await calculateSummary();
    } catch (error) {
      console.error('Error al añadir categoría:', error);
      throw error;
    }
  };

  const handleEditCategory = async (categoryId, categoryData) => {
    try {
      await updateDoc(doc(db, 'expenseCategories', categoryId), {
        ...categoryData,
        updatedAt: serverTimestamp(),
      });
      setCategories(prev =>
        prev.map(cat => cat.id === categoryId ? { ...cat, ...categoryData } : cat)
      );
      await calculateSummary();
    } catch (error) {
      console.error('Error al editar categoría:', error);
      throw error;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, 'expenseCategories', categoryId));
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      await calculateSummary();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      let receiptUrl = null;
      if (expenseData.receipt) {
        const storageRef = ref(storage, `receipts/${Date.now()}_${expenseData.receipt.name}`);
        await uploadBytes(storageRef, expenseData.receipt);
        receiptUrl = await getDownloadURL(storageRef);
      }

      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        receipt: receiptUrl,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setExpenses(prev => [...prev, { id: docRef.id, ...expenseData, receipt: receiptUrl }]);
      await calculateSummary();
    } catch (error) {
      console.error('Error al registrar gasto:', error);
      throw error;
    }
  };
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ExpenseSummary summary={summary} />
        </Grid>

        <Grid item xs={12}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Registro de Gastos" />
            <Tab label="Categorías" />
          </Tabs>

          {tabValue === 0 && (
            <ExpenseForm
              categories={categories}
              onSubmit={handleAddExpense}
            />
          )}

          {tabValue === 1 && (
            <ExpenseCategories
              categories={categories}
              onAdd={handleAddCategory}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Expenses;
