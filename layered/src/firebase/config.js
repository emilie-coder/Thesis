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
export async function createUser(userID) {
  try {
    const usersRef = ref(db, "users");
    const userRef = child(usersRef, userID);
    const projectRef = ref(db, "projectReferences");

    // Update the number of users
    const userNumberRef = ref(db, "totalUsers");
    const userNumberSnapshot = await get(userNumberRef);
    const userNumber = userNumberSnapshot.val();
    const realNumber = userNumber + 1;

    // Set a value for the user node (using userID as the key)
    set(userRef, { AllUserProjects: true, userNumber: realNumber, totalProjects: 0 });
    set(userNumberRef, realNumber);

    // Format the user number with leading zeros
    const formattedUserNumber = String(realNumber).padStart(3, "0");

    // Now push it as a child of the projectScene
    const projectRefChild = child(projectRef, formattedUserNumber);
    await set(projectRefChild, '001');
  } catch (error) {
    console.error("Error adding user:", error);
  }
}


export async function createUserProject(userID, username, title, templateID, templateType) {



  try {
    const usersRef = ref(db, "users");
    const userRef = child(usersRef, userID);
    const allUserProjectsRef = child(userRef, "AllUserProjects");


    // now we have to add the reference 

    // Set the title to "untitled" if it's blank or null
    const projectTitle = title || "untitled";

    // Push the project data into the AllUserProjects node and get the generated ID
    const newProjectRef = push(allUserProjectsRef, {
      title: projectTitle,
      username: username,
      templateID: templateID,
      createdAt: serverTimestamp(), // Adding the server timestamp
      projectTemplate: templateType,
      projectScene: null,
    });

    const newProjectID = newProjectRef.key; // Get the generated ID


    // now we want to copy the template from firebase and want to duplicate it under project scene
    const templateRef = ref(db, 'templates/' + templateID)
    const templateSnapshot = await get(templateRef);
    const templateData = templateSnapshot.val();

    // now push it as a child of the projectScene 
    const projectBranchRef = child(newProjectRef, 'projectScene');
    await set(projectBranchRef, templateData)
    return newProjectID;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error; // Rethrow the error to handle it at the calling site
  }



}



export async function updateProjectTitle(userID, editedTitle, projectID) {
  try {
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


export async function updateObjectTexture(userID, projectID, objectID, newTexture) {
  try {
    const objectRef = ref(db, `users/${userID}/AllUserProjects/${projectID}/projectScene/objects/${objectID}/material`);

    // Update the entire object with the modified data
    await set(objectRef, newTexture);
  } catch (error) {
    console.error('Error updating object texture', error);
    throw error; // Rethrow the error to handle it at the calling site
  }
}

export async function updateObjectPosition(userID, projectID, objectID, newPosition, newScale, newRotation) {
  try {
    // Reference to the specific project in Firebase Realtime Database
    const objectRefPositionRef = ref(db, `users/${userID}/AllUserProjects/${projectID}/projectScene/objects/${objectID}/position`);
    const objectRefScaleRef = ref(db, `users/${userID}/AllUserProjects/${projectID}/projectScene/objects/${objectID}/scale`);
    const objectRefRotRef = ref(db, `users/${userID}/AllUserProjects/${projectID}/projectScene/objects/${objectID}/rotation`);

    // Update the entire object with the modified data
    set(objectRefPositionRef, { x: newPosition.x, y: newPosition.y, z: newPosition.z });
    set(objectRefScaleRef, { x: newScale.x, y: newScale.y, z: newScale.z });
    set(objectRefRotRef, { x: newRotation._x, y: newRotation._y, z: newRotation._z });
  } catch (error) {
    console.error('Error updating object position', error);
    throw error; // Rethrow the error to handle it at the calling site
  }
}


export async function createNewLayerFB(userID, projectID) {
  try {
    // Reference to the specific project in Firebase Realtime Database
    const projectRef = ref(db, `users/${userID}/AllUserProjects/${projectID}/projectScene/objects`);

    const newObjectIndex = await get(projectRef, 'length'); // Get the current length of the array

    const newKey = `${newObjectIndex._node.children_.count()}`;

    const layerObject = {
      material: "https://firebasestorage.googleapis.com/v0/b/layered-5fb29.appspot.com/o/sqaure.png?alt=media&token=dd1d81ad-6eb2-4048-a518-576ce1a8766a",
      objectType: 0,
      objectTypeName: "plane", // Fixed a typo here (oobjectTypeName -> objectTypeName)
      position: {
        x: "0",
        y: "0",
        z: "0"
      },
      scale: {
        x: "1",
        y: "1",
        z: "1"
      },
      rotation: {
        x: "0",
        y: "0",
        z: "0"
      }
    }

    // Use the newObjectKey as the key for the pushed object
    const newObjectRef = child(projectRef, newKey);
    await set(newObjectRef, layerObject);

  } catch (error) {
    console.error('Error adding object:', error);
    throw error; // Rethrow the error to handle it at the calling site
  }
}



export async function fetchObjectTexture(userID, projectID, objectID) {
  try {
    const objectRef = ref(db, `users/${userID}/AllUserProjects/${projectID}/projectScene/objects/${objectID}/material`);

    const objectSnap = await get(objectRef);

    if (objectSnap.exists()) {
      const projectData = objectSnap.val();
      return projectData; // Return the project data
    } else {
      throw new Error("Project not found"); // Handle the case where the project doesn't exist
    }

  } catch (error) {
    console.error('Error updating object texture', error);
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
      // throw new Error("Project not found"); // Handle the case where the project doesn't exist
    }
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
}


export async function updateProject(userID, projectID, project) {
  try {
    const myDb = getDatabase();
    const projectRef = ref(myDb, `users/${userID}/AllUserProjects/${projectID}/projectScene`);

    // Retrieve the current project data
    const projectSnapshot = await get(projectRef);
    const currentProjectData = projectSnapshot.val();

    // Create a deep copy of project.objects and assign it to currentProjectData.objects
    currentProjectData.objects = { ...project.objects };
    currentProjectData.details = { ...project.details };
    currentProjectData.details.Audio  = typeof project.Audio === 'object' ? { ...project.details.Audio  } : project.details.Audio;
    currentProjectData.templateCover = typeof project.templateCover === 'object' ? { ...project.templateCover } : project.templateCover;


    // Update the timestamp for the project
    currentProjectData.lastSaved = Date.now(); // Use Date.now() to get the current timestamp

    // Update the project data
    await set(projectRef, currentProjectData);

    // Return the updated timestamp
    return currentProjectData.lastSaved;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}


export async function createTemplate(project) {
  try {
    const myDb = getDatabase();
    const projectRef = ref(myDb, `templates`);
    return push(projectRef, project);
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
      callback(data);
    });

  } catch (error) {
    console.error("Error finding templates", error);
    throw error; // Rethrow the error to handle it at the calling site
  }

}



// export function updateUserObjectPosition






export default app;