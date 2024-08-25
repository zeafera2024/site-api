const path = require("path");
const admin = require("firebase-admin");

// Caminho para o arquivo da chave do serviço do Firebase
const serviceAccountPath = path.resolve(
  __dirname,
  "project-freela-firebase-adminsdk-86npi-98e201e06c.json"
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

// Obtenha a instância do Firestore
const db = admin.firestore();
module.exports = { db };
