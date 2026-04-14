// ╔══════════════════════════════════════════════════════╗
// ║  firebase-config.example.js                          ║
// ║  ✅ SAFE TO COMMIT — contains no real secrets        ║
// ║                                                      ║
// ║  HOW TO USE:                                         ║
// ║  1. Copy this file → firebase-config.js              ║
// ║  2. Fill in your real values from Firebase Console   ║
// ║  3. Make sure firebase-config.js is in .gitignore    ║
// ╚══════════════════════════════════════════════════════╝

export const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://REPLACE_WITH_YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID"
};
