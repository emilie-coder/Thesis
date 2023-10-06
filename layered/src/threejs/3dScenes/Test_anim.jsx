import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { TextureLoader } from 'three';

const TestAnim = (props) => {
  const group = useRef();
  const { nodes, animations } = useGLTF('/animated/test_anim.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    actions.CylinderAction.play();
  }, [actions]);

  // Load the texture from the URL
  const textureLoader = new TextureLoader();
  const texture = textureLoader.load('https://firebasestorage.googleapis.com/v0/b/layered-5fb29.appspot.com/o/gie2QN4obGaUeCCvTotXNe06QP73%2Fproject_-NfD0FDtWnF1NpGIRqMt%2Fimages%2Ff_mountains.pngda639ace-74e6-40c0-abe9-6f72a1d196aa?alt=media&token=cd39eafa-90d6-4814-a79e-fb6833696cd5');
  
  // Apply the texture to the material of the Cylinder mesh
  if (nodes.Cylinder.material) {
    nodes.Cylinder.material.map = texture;
    nodes.Cylinder.material.needsUpdate = true;
  }

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <mesh name="Cylinder" geometry={nodes.Cylinder.geometry} material={nodes.Cylinder.material} />
      </group>
    </group>
  );
};

useGLTF.preload('/animated/test_anim.glb');

export default TestAnim;
