import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// eslint-disable-next-line no-unused-vars
import { getDatabase, ref, set, child, push, serverTimestamp, onValue, update, get } from "firebase/database";
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

    // console.log("User and AllUserProjects added successfully");
  } catch (error) {
    console.error("Error adding user:", error);
  }
}


export async function createUserProject(userID, username, title, templateID, templateType) {
  try {
    const usersRef = ref(db, "users");

    // Construct the path to the user node
    const userRef = child(usersRef, userID);

    // console.log("User found successfully");

    // Construct the path to the AllUserProjects child node under the user
    const allUserProjectsRef = child(userRef, "AllUserProjects");

    // Set the title to "untitled" if it's blank or null
    const projectTitle = title || "untitled";

    // Push the project data into the AllUserProjects node and get the generated ID
    const newProjectRef = push(allUserProjectsRef, {
      title: projectTitle,
      username: username,
      templateID: templateID,
      createdAt: serverTimestamp(), // Adding the server timestamp
      projectTemplate: templateType
    });

    const newProjectID = newProjectRef.key; // Get the generated ID

    // console.log("Project added under AllUserProjects with ID:", newProjectID);
    return newProjectID;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error; // Rethrow the error to handle it at the calling site
  }
}

export async function updateProjectTitle(userID, editedTitle, projectID) {
  try {
    console.log(projectID);
    // Reference to the specific project in Firebase Realtime Database
    const projectRef = ref(db, `users/${userID}/AllUserProjects/${projectID}`);

    // Retrieve the current project data
    const projectSnapshot = await get(projectRef);
    const currentProjectData = projectSnapshot.val();

    // Update only the title field
    currentProjectData.title = editedTitle;

    // Update the entire object with the modified data
    await set(projectRef, currentProjectData);
  } catch (error) {
    console.error('Error updating project title:', error);
    throw error; // Rethrow the error to handle it at the calling site
  }
}



// fetch
export function fetchUserProjects(userID, callback) {

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


export async function fetchProject(userID, projectID) {
  try {
    const myDb = getDatabase();
    const projectRef = ref(myDb, `users/${userID}/AllUserProjects/${projectID}`);

    const projectSnapshot = await get(projectRef);

    if (projectSnapshot.exists()) {
      const projectData = projectSnapshot.val();
      return projectData; // Return the project data
    } else {
      throw new Error("Project not found"); // Handle the case where the project doesn't exist
    }
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
}




export function fetchTemplates(userID, callback) {

  try{
    const myDb = getDatabase();
    const templates = ref(myDb, 'templates');
    onValue(templates, (snapshot) => {
      const data = snapshot.val();
      console.log("in fetch templates");
      // console.log(data);
      callback(data);
    });

  } catch (error) {
    console.error("Error finding templates", error);
    throw error; // Rethrow the error to handle it at the calling site
  }

}





export default app;