import React, { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Mountains = (props) => {
  const group = useRef();
  const [textureLoaded, setTextureLoaded] = useState(false);
  const { nodes } = useGLTF('/3dAssets/MyMountains.glb');

  const textureLoader = new THREE.TextureLoader();
  const texturePath = '/path/to/your/texture.jpg'; // Replace with the correct texture path

  textureLoader.load(texturePath, (texture) => {
    // This callback ensures the texture is fully loaded before using it.
    texture.minFilter = THREE.LinearFilter; // Optional: Adjust texture settings if needed

    // Create a material with the loaded texture
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true, // Enable transparency
      side: THREE.DoubleSide, // Render both sides of the mesh
    });

    // Apply the material with the texture
    nodes.mesh_0.material = material;

    // Set textureLoaded to true to indicate successful loading
    setTextureLoaded(true);
  }, undefined, (error) => {
    console.error('Error loading texture:', error);
    // Handle the error here, e.g., show a placeholder texture
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="defaultScene">
        <mesh
          name="mesh_0"
          geometry={nodes.mesh_0.geometry}
          position={[0, 2.767, 0]}
          scale={[35.846, 8.407, 35.846]}
        />
      </group>
    </group>
  );
};

useGLTF.preload('/3dAssets/MyMountains.glb');

export default Mountains;
