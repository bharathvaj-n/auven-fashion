import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
dotenv.config({override: true});

// Make sure to parse the private key properly if it contains escaped newlines
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  // Strip surrounding quotes if the user accidentally included them in Render/env
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');
}

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey
        })
    });
} else {
    console.warn("Firebase Admin credentials not fully provided in environment variables.");
}

export { getAuth };
