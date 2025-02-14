const admin = require('firebase-admin');

// La configuración específica de tu proyecto
const firebaseConfig = {
  projectId: "institutogestion-80e6b",
  databaseURL: "https://institutogestion-80e6b-default-rtdb.firebaseio.com",
  storageBucket: "institutogestion-80e6b.firebasestorage.app",
};

// Inicializar Firebase Admin con la configuración de tu proyecto
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
  databaseURL: firebaseConfig.databaseURL,
  storageBucket: firebaseConfig.storageBucket,
  projectId: firebaseConfig.projectId
});

const auth = admin.auth();
const db = admin.firestore();

async function initializeAdmin() {
  try {
    // Crear usuario admin en Authentication
    const userRecord = await auth.createUser({
      email: 'admin@bellasartes.com',
      password: 'Admin123!',
      displayName: 'Administrador',
      emailVerified: true
    });

    console.log('Usuario administrador creado:', userRecord.uid);

    // Establecer claims personalizados
    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true
    });

    // Crear documento en Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: 'admin@bellasartes.com',
      displayName: 'Administrador',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      uid: userRecord.uid
    });

    console.log('Documento de usuario creado en Firestore');
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('El usuario ya existe, actualizando permisos...');
      
      // Obtener usuario existente
      const userRecord = await auth.getUserByEmail('admin@bellasartes.com');
      
      // Actualizar claims
      await auth.setCustomUserClaims(userRecord.uid, {
        admin: true
      });

      // Actualizar documento en Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: 'admin@bellasartes.com',
        displayName: 'Administrador',
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        uid: userRecord.uid
      }, { merge: true });

      console.log('Usuario existente actualizado con éxito');
      return userRecord;
    }
    
    console.error('Error en la inicialización:', error);
    throw error;
  }
}

// Ejecutar la inicialización
initializeAdmin()
  .then(() => {
    console.log('Inicialización completada con éxito');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el proceso de inicialización:', error);
    process.exit(1);
  });
