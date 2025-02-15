interface Estudiante {
  id: string;
  nombre: string;
  apellidos: string;
  ci: string;
  calificaciones?: string[];
}

interface Calificacion {
  id: string;
  estudianteId: string;
  materiaId: string;
  profesorId: string;
  nota: number;
  periodo: string;
  fechaEvaluacion: string;
  observaciones?: string;
}

interface Materia {
  id: string;
  nombre: string;
  codigo: string;
  profesorId: string;
  calificaciones?: string[];
}

export type { Estudiante, Calificacion, Materia };
