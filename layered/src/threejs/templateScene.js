import { Suspense, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Plane, TransformControls, useCursor } from '@react-three/drei';
import create from 'zustand';
import DuckScene from './3dScenes/DuckScene';
import SimpleFlower from './3dScenes/Test_flower';
import { TextureLoader } from 'three'; // Import TextureLoader from Three.js
import { useControls } from 'leva'

// Import THREE from Three.js
import * as THREE from 'three';

export default function TemplateScene(props) {
  const sceneObjs = props.scene;

  // Define and use the 'target' state variable using the 'useStore' hook
  const useStore = create((set) => ({
    target: null,
    setTarget: (target) => set({ target }),
  }));

  const setTarget = useStore((state) => state.setTarget);
  const target = useStore((state) => state.target); // Access 'target' from the state
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const textureLoader = new TextureLoader();
  const colorMap = textureLoader.load('https://firebasestorage.googleapis.com/v0/b/layered-5fb29.appspot.com/o/PMjmiBCAdebvZabW0gRb3ys7QoR2%2Fproject_-Ncchl6YZ6wd-4rSIp2Z%2Fimages%2Fflower_petal.png0d9ef143-3986-4983-9cf5-426ac9e3b4dd?alt=media&token=445dd45b-5c9e-4298-9fca-5b1f534564f4')

  const instantiateObjects = () => {
    if (sceneObjs && sceneObjs.objects) {
      return sceneObjs.objects.map((item, index) => {
        // console.log(item);

        // Load the texture from the item.material URL
        const textureLoader = new TextureLoader();
        const texture = textureLoader.load(item.material);

        // Create a material with the loaded texture
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true, // Enable transparency
          alphaTest: 0.5, // Adjust the alphaTest value as needed
          side: THREE.DoubleSide, // Render both sides of the mesh
        });

        return (
          <mesh
            {...props}
            onClick={(e) => {
              console.log("Clicked on the plane:", e);
              setTarget(e.object);
            }}
            // onClick={(e) => setTarget(e.object)}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            key={index}
            position={[item.position.x, item.position.y, item.position.z]}
            rotation={[item.rotation.x, item.rotation.y, item.rotation.z]}
            scale={[item.scale.x, item.scale.y, item.scale.z]}
            material={material} // Apply the material with the texture
          >
            <planeGeometry />
          </mesh>
        );
      });
    }

    return null; // Return null if sceneObjs.objects is not available
  };

  return (
    <Canvas dpr={[1, 2]} onPointerMissed={() => setTarget(null)}>
      <Suspense fallback={null}>
        <gridHelper args={[400, 200, '#151515', '#020202']} position={[0, -4, 0]} />
        <ambientLight intensity={1.0} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow={true} />

        {instantiateObjects()}

        {/* Use 'target' from the state */}
        {target && <TransformControls object={target} mode="translate" />}
        <OrbitControls makeDefault />
      </Suspense>
    </Canvas>
  );
}
