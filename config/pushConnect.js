const admin = require("firebase-admin");

let serviceAccount = require("../pinple-24129-firebase-adminsdk-kyntj-da88679fe6.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
