const admin = require('firebase-admin');
const config = require('./config');

/**
 * firebaseAdmin.js
 * ----------------
 * Initializes firebase-admin using the service account JSON from the
 * FIREBASE_SERVICE_ACCOUNT env var. This SDK has FULL admin access -
 * it's what lets the bot write directly to any user's Firestore doc
 * (something the mobile app itself is never allowed to do for other users).
 */
let serviceAccount;
try {
  serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT);
} catch (err) {
  console.error('[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT is not valid JSON:', err.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
