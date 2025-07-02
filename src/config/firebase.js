require("dotenv").config();
const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

  // 🔧 Replace escaped newlines (\\n) with actual newlines (\n)
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://kealthy-90c55-dd236.firebaseio.com/",
  });
}

const db = admin.database();
module.exports = db;
