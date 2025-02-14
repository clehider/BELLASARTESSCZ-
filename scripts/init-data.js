const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://institutogestion-80e6b-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

const initialData = {
  modulos: [
    {
      nombre: "Artes Visuales",
      descripcion: "Técnicas y fundamentos de las artes visuales",
      estado: "activo",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      nombre: "Música",
      descripcion: "Teoría musical y práctica instrumental",
      estado: "activo",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      nombre: "Danza",
      descripcion: "Expresión corporal y coreografía",
      estado: "activo",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  materias: [
    {
      nombre: "Dibujo y Pintura",
      moduloId: "artes-visuales",
      descripcion: "Técnicas fundamentales de dibujo y pintura",
      creditos: 4,
      estado: "activo",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      nombre: "Piano",
      moduloId: "musica",
      descripcion: "Clases de piano y teoría musical",
      creditos: 4,
      estado: "activo",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      nombre: "Ballet Clásico",
      moduloId: "danza",
      descripcion: "Fundamentos de ballet clásico",
      creditos: 4,
      estado: "activo",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  estudiantes: [
    {
      nombre: "Ana María González",
      email: "ana.gonzalez@bellasartes.com",
      moduloId: "artes-visuales",
      estado: "activo",
      fechaInscripcion: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      nombre: "Carlos Rodríguez",
      email: "carlos.rodriguez@bellasartes.com",
      moduloId: "musica",
      estado: "activo",
      fechaInscripcion: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      nombre: "Laura Martínez",
      email: "laura.martinez@bellasartes.com",
      moduloId: "danza",
      estado: "activo",
      fechaInscripcion: admin.firestore.FieldValue.serverTimestamp()
    }
  ]
};

async function initializeCollections() {
  try {
    for (const [collection, documents] of Object.entries(initialData)) {
      console.log(`Inicializando colección: ${collection}`);
      
      for (const doc of documents) {
        const docRef = await db.collection(collection).add(doc);
        console.log(`Documento creado en ${collection} con ID: ${docRef.id}`);
      }
    }
    
    console.log('Inicialización completada con éxito');
  } catch (error) {
    console.error('Error en la inicialización:', error);
  }
}

initializeCollections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
