// var admin = require("firebase-admin");

// // Check if serviceAccountKey.json exists before requiring
// var serviceAccount;
// try {
//   serviceAccount = require("./serviceAccountKey.json");
// } catch (error) {
//   console.warn("Firebase serviceAccountKey.json not found in config directory.");
//   // We can use a mock or incomplete init to prevent crash, OR relying on default credentials
//   // For now, let's keep it undefined so we can handle it gracefully in the bucket logic
// }

// if (serviceAccount) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "cuan-shop.appspot.com"
//   });
// } else {
//     // Initialize with no-op/default if key is missing (dev mode fallback if needed) or just don't init
//     // Better to log error if it's critical
//     console.error("Firebase Admin not initialized. Uploads will fail.");
// }

// const bucket = serviceAccount ? admin.storage().bucket() : null;

// module.exports = { bucket };
