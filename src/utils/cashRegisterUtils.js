import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export const closeCashRegister = async (registerId, closeData) => {
  try {
    const registerRef = doc(db, 'cashRegisters', registerId);
    
    await updateDoc(registerRef, {
      status: 'closed',
      closedAt: serverTimestamp(),
      finalBalance: closeData.total,
      difference: closeData.difference,
      counts: closeData.counts,
      notes: closeData.notes,
    });

    // Registrar el cierre en el historial
    await addDoc(collection(db, 'cashRegisterHistory'), {
      registerId,
      type: 'close',
      data: closeData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    throw error;
  }
};

export const reconcileCashRegister = async (registerId, adjustmentData) => {
  try {
    const registerRef = doc(db, 'cashRegisters', registerId);
    
    // Registrar el ajuste
    await addDoc(collection(db, 'transactions'), {
      registerId,
      type: 'adjustment',
      amount: adjustmentData.amount,
      description: adjustmentData.reason,
      timestamp: serverTimestamp(),
    });

    // Actualizar el balance
    await updateDoc(registerRef, {
      currentBalance: adjustmentData.newBalance,
      lastReconciliation: serverTimestamp(),
    });

    // Registrar la conciliación en el historial
    await addDoc(collection(db, 'cashRegisterHistory'), {
      registerId,
      type: 'reconciliation',
      data: adjustmentData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error en la conciliación:', error);
    throw error;
  }
};

export const validateCashCount = (countData, expectedAmount) => {
  const total = Object.entries(countData.counts).reduce(
    (sum, [denom, count]) => sum + (parseFloat(denom) * count),
    0
  );
  
  return {
    isValid: total === expectedAmount,
    difference: total - expectedAmount,
    total,
  };
};

export const getCashRegisterHistory = async (registerId) => {
  try {
    const historyQuery = query(
      collection(db, 'cashRegisterHistory'),
      where('registerId', '==', registerId)
    );
    
    const snapshot = await getDocs(historyQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};
