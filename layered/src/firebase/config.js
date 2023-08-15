import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// eslint-disable-next-line no-unused-vars
import { getDatabase, ref, set, child, push, serverTimestamp, onValue } from "firebase/database";
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
export function createUser(userID) {
  try {
    const usersRef = ref(db, "users");
    const userRef = child(usersRef, userID);

    // Set a value for the user node (using userID as the key)
    set(userRef, { AllUserProjects: true });

    console.log("User and AllUserProjects added successfully");
  } catch (error) {
    console.error("Error adding user:", error);
  }
}


export async function createUserProject(userID, username, title) {
  try {
    const usersRef = ref(db, "users");

    // Construct the path to the user node
    const userRef = child(usersRef, userID);

    console.log("User found successfully");

    // Construct the path to the AllUserProjects child node under the user
    const allUserProjectsRef = child(userRef, "AllUserProjects");

    // Push the project data into the AllUserProjects node and get the generated ID
    const newProjectRef = push(allUserProjectsRef, {
      title: title,
      username: username,
      createdAt: serverTimestamp() // Adding the server timestamp
    });

    const newProjectID = newProjectRef.key; // Get the generated ID

    console.log("Project added under AllUserProjects with ID:", newProjectID);
    return newProjectID;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error; // Rethrow the error to handle it at the calling site
  }
}



// fetch
export function fetchNotes(userID, callback) {

  try{
    const myDb = getDatabase();
    const noteHashMap = ref(myDb, 'users/' + userID + '/AllUserProjects');
    onValue(noteHashMap, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    });

  } catch (error) {
    console.error("Error adding project:", error);
    throw error; // Rethrow the error to handle it at the calling site
  }

}




export default app;