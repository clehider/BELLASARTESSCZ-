import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress,
  Alert,
  Box,
  Button
} from '@mui/material';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb, auth } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    todayTransactions: 0,
    currentBalance: 0,
    recentActivity: []
  });

  useEffect(() => {
    if (!currentUser) return;
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener fecha de inicio del día actual
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Consulta para transacciones del día
        const transactionsRef = collection(db, 'transactions');
        const todayQuery = query(
          transactionsRef,
          where('userId', '==', currentUser.uid),
          where('timestamp', '>=', Timestamp.fromDate(today))
        );

        const todaySnapshot = await getDocs(todayQuery);
        
        // Calcular estadísticas
        let todayTotal = 0;
        let balance = 0;
        const recentActivity = [];
        
        todaySnapshot.forEach(doc => {
          const transaction = doc.data();
          const amount = Number(transaction.amount) || 0;
          
          if (transaction.type === 'income') {
            balance += amount;
            todayTotal += amount;
          } else {
            balance -= amount;
            todayTotal -= amount;
          }
          
          recentActivity.push({
            id: doc.id,
            ...transaction,
            amount: amount
          });
        });

        // Ordenar actividad reciente por fecha
        recentActivity.sort((a, b) => b.timestamp - a.timestamp);

        setStats({
          totalTransactions: todaySnapshot.size,
          todayTransactions: todaySnapshot.size,
          currentBalance: balance,
          recentActivity: recentActivity
        });

        // Suscribirse a actualizaciones en tiempo real
        const activityRef = ref(rtdb, `userActivity/${currentUser.uid}`);
        const unsubscribe = onValue(activityRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Actualizar datos en tiempo real si es necesario
            loadDashboardData();
          }
        });

        return () => unsubscribe();

      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Balance Actual */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Balance Actual
            </Typography>
            <Typography component="p" variant="h4">
              ${stats.currentBalance.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        {/* Transacciones de Hoy */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Transacciones Hoy
            </Typography>
            <Typography component="p" variant="h4">
              {stats.todayTransactions}
            </Typography>
          </Paper>
        </Grid>

        {/* Total Transacciones */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Transacciones
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalTransactions}
            </Typography>
          </Paper>
        </Grid>

        {/* Actividad Reciente */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Actividad Reciente
            </Typography>
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <Paper 
                  key={activity.id} 
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {activity.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(activity.timestamp?.seconds * 1000).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    color={activity.type === 'income' ? 'success.main' : 'error.main'}
                  >
                    {activity.type === 'income' ? '+' : '-'}${activity.amount.toFixed(2)}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                No hay actividad reciente
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
