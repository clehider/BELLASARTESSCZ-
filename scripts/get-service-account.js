const fs = require('fs');
const path = require('path');

// Función para crear el archivo serviceAccountKey.json
function createServiceAccountFile(serviceAccountJson) {
  const filePath = path.join(__dirname, 'serviceAccountKey.json');
  fs.writeFileSync(filePath, JSON.stringify(serviceAccountJson, null, 2));
  console.log('Archivo serviceAccountKey.json creado con éxito');
}

// Ejemplo de estructura de serviceAccountKey
const serviceAccountTemplate = {
  "type": "service_account",
  "project_id": "institutogestion-80e6b",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "YOUR_PRIVATE_KEY",
  "client_email": "firebase-adminsdk-xxxxx@institutogestion-80e6b.iam.gserviceaccount.com",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40institutogestion-80e6b.iam.gserviceaccount.com"
};

console.log('Por favor, complete la información en el archivo serviceAccountKey.json');
createServiceAccountFile(serviceAccountTemplate);
