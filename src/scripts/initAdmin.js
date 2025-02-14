const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const createAdminUser = async () => {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'admin@bellasartes.com',
      password: 'Admin123!',
      displayName: 'Administrador',
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true
    });

    // Crear documento de usuario en Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Usuario administrador creado exitosamente:', userRecord.uid);
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
  }
};

createAdminUser();
