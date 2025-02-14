import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const auditService = {
  logAction: async (userId, action, details) => {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        userId,
        action,
        details,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        ip: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip)
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  },

  getFormattedDate: (date) => {
    if (!date) return '';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Date(date).toLocaleString('es-BO', options);
  }
};
