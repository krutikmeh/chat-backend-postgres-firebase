import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is missing in .env');
}

const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);

if (!fs.existsSync(resolvedPath)) {
  throw new Error(`Firebase service account file not found at: ${resolvedPath}`);
}

const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const firestore = getFirestore();
export const serverTimestamp = FieldValue.serverTimestamp;