import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, push } from "firebase/database";
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6HgZq78EPcqfwROC-x21r-pBCrNSzqG4",
  authDomain: "layered-5fb29.firebaseapp.com",
  databaseURL: "https://layered-5fb29-default-rtdb.firebaseio.com",
  projectId: "layered-5fb29",
  storageBucket: "layered-5fb29.appspot.com",
  messagingSenderId: "156993383372",
  appId: "1:156993383372:web:d4b1c8e472cdfa8cb64b69",
  measurementId: "G-L4CRY7HJP0"
};


const app = initializeApp(firebaseConfig);
export const myAuth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

// Create user
export function createUser(note) {
  try {
    const usersRef = ref(db, "users");
    push(usersRef, note);
    console.log("User note added successfully");
  } catch (error) {
    console.error("Error adding user note:", error);
  }
}

export default app;