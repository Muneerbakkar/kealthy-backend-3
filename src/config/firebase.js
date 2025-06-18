const admin = require("firebase-admin");
const path = require("path");

// Go two levels up from /src/config to backend/
const serviceAccount = require(path.join(__dirname, "../../serviceAccountKey.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://kealthy-90c55-dd236.firebaseio.com/"
  });
}

const db = admin.database();
module.exports = db;
