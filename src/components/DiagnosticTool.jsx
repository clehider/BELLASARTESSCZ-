import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Box, Typography, Paper } from '@mui/material';

const DiagnosticTool = () => {
  const [diagnosticInfo, setDiagnosticInfo] = useState('');

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        setDiagnosticInfo(prev => prev + '\nIniciando diagnóstico...');
        
        // Probar acceso a Firestore
        const collections = ['users', 'modulos', 'materias', 'estudiantes'];
        for (const collectionName of collections) {
          try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            setDiagnosticInfo(prev => 
              prev + `\nColección ${collectionName}: ${querySnapshot.size} documentos encontrados`
            );
            
            // Mostrar primer documento como ejemplo
            if (!querySnapshot.empty) {
              const firstDoc = querySnapshot.docs[0].data();
              setDiagnosticInfo(prev => 
                prev + `\nEjemplo de documento en ${collectionName}:\n${JSON.stringify(firstDoc, null, 2)}`
              );
            }
          } catch (error) {
            setDiagnosticInfo(prev => 
              prev + `\nError al acceder a ${collectionName}: ${error.message}`
            );
          }
        }

      } catch (error) {
        setDiagnosticInfo(prev => 
          prev + `\nError general: ${error.message}`
        );
      }
    };

    runDiagnostics();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Diagnóstico del Sistema</Typography>
        <Box component="pre" sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: '#f5f5f5', 
          borderRadius: 1,
          whiteSpace: 'pre-wrap',
          fontSize: '0.875rem'
        }}>
          {diagnosticInfo || 'Ejecutando diagnóstico...'}
        </Box>
      </Paper>
    </Box>
  );
};

export default DiagnosticTool;
