export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR') {
    super(message);
    this.code = code;
  }
}

export const handleError = (error, actionDescription = '') => {
  console.error(`Error ${actionDescription}:`, error);
  
  if (error instanceof AppError) {
    return error.message;
  }

  // Firebase Auth errors
  if (error.code?.startsWith('auth/')) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/invalid-email':
        return 'Email inválido';
      default:
        return 'Error de autenticación';
    }
  }

  // Firestore errors
  if (error.code?.startsWith('firestore/')) {
    return 'Error en la base de datos';
  }

  return 'Ha ocurrido un error. Por favor, intente nuevamente.';
};
