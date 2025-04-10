const admin = require("firebase-admin");
const serviceAccount = require("../maidlink-e3e5b-firebase-adminsdk-fbsvc-57fae22d12.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = { admin };
