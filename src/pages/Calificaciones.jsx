import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';

const Calificaciones = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);

  // Función para cargar datos relacionados
  const cargarDatosRelacionados = async () => {
    try {
      // Cargar estudiantes
      const estudiantesSnapshot = await getDocs(collection(db, 'estudiantes'));
      const estudiantesData = estudiantesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEstudiantes(estudiantesData);

      // Cargar materias
      const materiasSnapshot = await getDocs(collection(db, 'materias'));
      const materiasData = materiasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterias(materiasData);

      // Cargar profesores
      const profesoresSnapshot = await getDocs(collection(db, 'profesores'));
      const profesoresData = profesoresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProfesores(profesoresData);

      // Cargar calificaciones con datos relacionados
      const calificacionesSnapshot = await getDocs(collection(db, 'calificaciones'));
      const calificacionesData = calificacionesSnapshot.docs.map(doc => {
        const calificacion = doc.data();
        const estudiante = estudiantesData.find(e => e.id === calificacion.estudianteId);
        const materia = materiasData.find(m => m.id === calificacion.materiaId);
        const profesor = profesoresData.find(p => p.id === calificacion.profesorId);

        return {
          id: doc.id,
          ...calificacion,
          estudiante,
          materia,
          profesor
        };
      });
      setCalificaciones(calificacionesData);
    } catch (error) {
      console.error('Error al cargar datos relacionados:', error);
    }
  };

  // Función para guardar una calificación
  const guardarCalificacion = async (calificacionData) => {
    try {
      const nuevaCalificacion = {
        ...calificacionData,
        fechaCreacion: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'calificaciones'), nuevaCalificacion);

      // Actualizar referencias en estudiantes
      const estudianteRef = doc(db, 'estudiantes', calificacionData.estudianteId);
      await updateDoc(estudianteRef, {
        calificaciones: arrayUnion(docRef.id)
      });

      // Actualizar referencias en materias
      const materiaRef = doc(db, 'materias', calificacionData.materiaId);
      await updateDoc(materiaRef, {
        calificaciones: arrayUnion(docRef.id)
      });

      await cargarDatosRelacionados();
    } catch (error) {
      console.error('Error al guardar calificación:', error);
    }
  };

  // Función para eliminar una calificación
  const eliminarCalificacion = async (calificacionId, estudianteId, materiaId) => {
    try {
      await deleteDoc(doc(db, 'calificaciones', calificacionId));
      
      const estudianteRef = doc(db, 'estudiantes', estudianteId);
      await updateDoc(estudianteRef, {
        calificaciones: arrayRemove(calificacionId)
      });

      const materiaRef = doc(db, 'materias', materiaId);
      await updateDoc(materiaRef, {
        calificaciones: arrayRemove(calificacionId)
      });

      await cargarDatosRelacionados();
      return true;
    } catch (error) {
      console.error('Error al eliminar calificación:', error);
      return false;
    }
  };

  useEffect(() => {
    cargarDatosRelacionados();
  }, []);

  return (
    <div>
      {/* Implementa aquí tu interfaz de usuario */}
    </div>
  );
};

export default Calificaciones;
