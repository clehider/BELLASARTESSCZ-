import { format as formatDate, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const dateConfig = {
  locale: es,
  format: (date, formatStr = 'dd/MM/yyyy HH:mm') => {
    if (!date) return '';
    try {
      const parsedDate = typeof date === 'string' ? parseISO(date) : date;
      return formatDate(parsedDate, formatStr, { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }
};
