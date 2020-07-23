import React, { createContext } from 'react';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

const FirebaseContext = createContext(null);
export { FirebaseContext };

// Initialize Firebase
let config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export default ({ children }) => {
  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }

  return (
    <FirebaseContext.Provider value={firebase} db={firebase.firestore()}>
      {children}
    </FirebaseContext.Provider>
  );
};
