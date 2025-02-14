import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(amount);
};

export const calculateMonthlyStats = (expenses, date = new Date()) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const prevStart = startOfMonth(subMonths(date, 1));
  const prevEnd = endOfMonth(subMonths(date, 1));

  const currentMonthExpenses = expenses.filter(
    expense => expense.date >= start && expense.date <= end
  );

  const prevMonthExpenses = expenses.filter(
    expense => expense.date >= prevStart && expense.date <= prevEnd
  );

  const currentTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const prevTotal = prevMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return {
    currentTotal,
    prevTotal,
    change: prevTotal === 0 ? 100 : ((currentTotal - prevTotal) / prevTotal) * 100,
    count: currentMonthExpenses.length
  };
};

export const groupExpensesByCategory = (expenses, categories) => {
  return categories.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category === category.id);
    const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
      ...category,
      total,
      count: categoryExpenses.length,
      percentage: category.budgetLimit > 0 ? (total / category.budgetLimit) * 100 : 0
    };
  });
};

export const validateExpense = (expenseData) => {
  const errors = {};

  if (!expenseData.amount || expenseData.amount <= 0) {
    errors.amount = 'El monto debe ser mayor a 0';
  }

  if (!expenseData.category) {
    errors.category = 'Debe seleccionar una categoría';
  }

  if (!expenseData.description || expenseData.description.trim() === '') {
    errors.description = 'La descripción es requerida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const generateExpenseReport = (expenses, categories, dateRange) => {
  const { start, end } = dateRange;
  const filteredExpenses = expenses.filter(
    expense => expense.date >= start && expense.date <= end
  );

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categorySummary = groupExpensesByCategory(filteredExpenses, categories);

  return {
    period: `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`,
    totalAmount,
    categorySummary,
    expenseCount: filteredExpenses.length,
    averageExpense: totalAmount / filteredExpenses.length || 0
  };
};
