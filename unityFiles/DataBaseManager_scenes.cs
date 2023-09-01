// Emilie Hopkinson
// Project: Layered
// Thesis Project - Summer 2023

//___________________________________ generic imports
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

// __________________________________ firebase imports
using Firebase;
using Firebase.Database;
using Firebase.Extensions;
using System;

//___________________________________ web requests for downloading images
using System.Threading.Tasks;
using UnityEngine.Networking;

public class DataBaseManager_scenes : MonoBehaviour
{
    // the firebase database reference which we fill at start
    private DatabaseReference dbReference;
    private DataSnapshot currentSnapshot;
    public GameObject testTexture;

    public Texture2D testTexture2;
    public Material transparentMaterial;

    //_________________________________________________________________________________________
    // instantiate the reference :D
    //_________________________________________________________________________________________
    void Start()
    {
        // grabbing reference from the json in Assets
        dbReference = FirebaseDatabase.DefaultInstance.RootReference;

        ReadData();
    }

    //_________________________________________________________________________________________
    //_____________________ update function called every frame - will grab things from database as scenes change
    //_________________________________________________________________________________________
    public void Update()
    {
        testTexture.GetComponent<Renderer>().material.mainTexture = testTexture2;
        //________________________________ if we have changed the scene and are currently not on the users chosen scene
    }

    void LoadImage(string materialName, Material existingMaterial)
    {
        StartCoroutine(GetTexture(materialName, existingMaterial));
    }

    IEnumerator GetTexture(string image_link, Material existingMaterial)
    {
        UnityWebRequest www = UnityWebRequestTexture.GetTexture(image_link);
        yield return www.SendWebRequest();

        if (www.result != UnityWebRequest.Result.Success)
        {
            Debug.Log(www.error);
        }
        else
        {
            Texture2D texture = ((DownloadHandlerTexture)www.downloadHandler).texture;
            existingMaterial.mainTexture = texture;
        }
    }

    public void ReadData()
    {
        FirebaseDatabase.DefaultInstance
        .GetReference("users/gie2QN4obGaUeCCvTotXNe06QP73/AllUserProjects/-NdDqcUG83nOJrOlwDBN/projectScene/objects")
        .GetValueAsync().ContinueWithOnMainThread(task => {
            if (task.IsFaulted)
            {
                // Handle the error...
                Debug.Log("Reading data FAILED");
            }
            else if (task.IsCompleted)
            {
                DataSnapshot snapshot = task.Result;

                currentSnapshot = snapshot;

                // Iterate through the first-level children of the snapshot
                foreach (var childSnapshot in snapshot.Children)
                {
                    Debug.Log("Child Key: " + childSnapshot.Key);
                    Debug.Log("Child Value: " + childSnapshot.Value);

                    // Instantiate the object
                    GameObject instantiatedObject = Instantiate(testTexture);

                    // Get the position data from Firebase
                    Vector3 position = new Vector3(
                        float.Parse(childSnapshot.Child("position").Child("x").Value.ToString()),
                        float.Parse(childSnapshot.Child("position").Child("y").Value.ToString()),
                        float.Parse(childSnapshot.Child("position").Child("z").Value.ToString())
                    );

                    // Set the position of the instantiated object
                    instantiatedObject.transform.position = position;

                    // Get the scale data from Firebase
                    Vector3 scale = new Vector3(
                        float.Parse(childSnapshot.Child("scale").Child("x").Value.ToString()),
                        float.Parse(childSnapshot.Child("scale").Child("y").Value.ToString()),
                        float.Parse(childSnapshot.Child("scale").Child("z").Value.ToString())
                    );

                    // Set the scale of the instantiated object
                    instantiatedObject.transform.localScale = scale;

                    // Get the rotation data from Firebase
                    Quaternion rotation = Quaternion.Euler(
                        float.Parse(childSnapshot.Child("rotation").Child("x").Value.ToString()),
                        float.Parse(childSnapshot.Child("rotation").Child("y").Value.ToString()),
                        float.Parse(childSnapshot.Child("rotation").Child("z").Value.ToString())
                    );

                    // Set the rotation of the instantiated object
                    instantiatedObject.transform.rotation = rotation;

                    // Get the material name from Firebase
                    string materialName = childSnapshot.Child("material").Value.ToString();

                    Debug.Log("material name incoming");
                    Debug.Log(materialName);

                    // Duplicate the transparentMaterial for the object
                    Material newMaterial = new Material(transparentMaterial);

                    // Load the texture and assign it to the new material
                    LoadImage(materialName, newMaterial);

                    // Assign the new material to the object
                    Renderer renderer = instantiatedObject.GetComponent<Renderer>();
                    if (renderer != null)
                    {
                        renderer.material = newMaterial;
                    }
                }
            }
        });
    }
}
