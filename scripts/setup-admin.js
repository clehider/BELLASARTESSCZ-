const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin con las credenciales correctas
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://institutogestion-80e6b-default-rtdb.firebaseio.com"
});

async function createAdminUser() {
  try {
    // Crear usuario en Authentication
    const userRecord = await admin.auth().createUser({
      email: 'admin@bellasartes.com',
      password: 'Admin123!',
      emailVerified: true,
      displayName: 'Administrador'
    });

    console.log('Usuario creado:', userRecord.uid);

    // Asignar rol de administrador
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true
    });

    // Crear documento en Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: 'admin@bellasartes.com',
      displayName: 'Administrador',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      uid: userRecord.uid
    });

    console.log('¡Configuración completada con éxito!');
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('El usuario ya existe, actualizando...');
      const existingUser = await admin.auth().getUserByEmail('admin@bellasartes.com');
      await admin.auth().setCustomUserClaims(existingUser.uid, { admin: true });
      
      // Actualizar documento en Firestore
      await admin.firestore().collection('users').doc(existingUser.uid).set({
        email: 'admin@bellasartes.com',
        displayName: 'Administrador',
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        uid: existingUser.uid
      }, { merge: true });
      
      console.log('Usuario actualizado con éxito');
      return existingUser;
    }
    console.error('Error:', error);
    throw error;
  }
}

createAdminUser()
  .then((userRecord) => {
    console.log('Proceso completado. UID del usuario:', userRecord.uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en el proceso:', error);
    process.exit(1);
  });
