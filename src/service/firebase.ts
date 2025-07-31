// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDQyq0I_30gMgP1FQpZ3nBmShzEpxcI4yY',
  authDomain: 'evolenthealth-6c599.firebaseapp.com',
  databaseURL: 'https://evolenthealth-6c599.firebaseio.com',
  projectId: 'evolenthealth-6c599',
  storageBucket: 'evolenthealth-6c599.firebasestorage.app',
  messagingSenderId: '874582586649',
  appId: '1:874582586649:web:047df1d8b5cd99da3d4188',
  measurementId: 'G-5H512MJRFC',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
