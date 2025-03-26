// import * as admin from 'firebase-admin';
// import path from 'path';
// import fs from 'fs';

// // Ensure Firebase is not initialized multiple times
// if (!admin.apps.length) {
//   if (process.env.NODE_ENV === 'production') {
//     const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');
//     const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

//     // Ensure the private_key is correctly formatted
//     serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//     });
//   } else {
//     // Development environment: Use a dummy key
//     admin.initializeApp({
//       projectId: 'zero-hunger-dev',
//       credential: admin.credential.cert({
//         projectId: 'zero-hunger-dev',
//         clientEmail: 'dummy@zero-hunger-dev.iam.gserviceaccount.com',
//         privateKey: `-----BEGIN PRIVATE KEY-----
// MIIEvwIBADANBgkqhkiG9w0BAQEFAASC...
// ...dummy-private-key-for-development...
// -----END PRIVATE KEY-----`.replace(/\\n/g, '\n'),
//       }),
//     });
//   }
// }

// // Export Firestore database instance
// export const db = admin.firestore();

import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if Firebase is already initialized
if (!admin.apps.length) {
  let serviceAccount: any;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n'); // Fix formatting issue

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is missing from environment variables!");
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
