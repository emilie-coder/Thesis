/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.12 public/3dAssets/concerto/scene.gltf 
Author: Gregory Khodyrev (https://sketchfab.com/gmaaailgrisha)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/concerto-c8f9ff8fd8fd404b8432ba0982c40034
Title: Concerto
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

const DuckScene = (props) => {
  const { nodes, materials } = useGLTF('/3dAssets/concerto/scene.gltf')
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={1.466}>
        <group position={[0, 0, 0.625]} rotation={[0, 0, -0.635]}>
          <mesh geometry={nodes.Roundcube_0.geometry} material={materials.Head} />                      {/* body */}
          <mesh geometry={nodes.Roundcube_1.geometry} material={materials.Bill}  />                      {/* beack */}
          <mesh geometry={nodes.Roundcube_2.geometry} material={materials.material_3} />                {/* eyes */}
          <mesh geometry={nodes.Roundcube_4.geometry} material={materials.Bill} />                      {/* beack */}  
        </group>

        <group position={[-1.805, -0.409, -4.583]} rotation={[-Math.PI / 2, 1.433, Math.PI / 2]}>
          <mesh geometry={nodes.Circle007_0.geometry} material={materials.Leaf} />                      {/* lily pads */}    
        </group>

        <mesh geometry={nodes.Plane_0.geometry} material={materials.Water} />                           {/* water plane */} 

      </group>
    </group>
  )
}

useGLTF.preload('/3dAssets/concerto/scene.gltf')

export default DuckScene;