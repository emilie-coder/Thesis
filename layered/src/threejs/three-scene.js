import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; 

class ThreeScene extends Component {
  componentDidMount() {
    // scene
    this.scene = new THREE.Scene();

    // renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Append the renderer's DOM element to the component's ref
    this.mount.appendChild(this.renderer.domElement);

    // camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    // create box
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
    });
    this.cube = new THREE.Mesh(geometry, material);

    // add the cube to the scene
    this.scene.add(this.cube);

    // Call the render function
    this.renderScene();

    // Call the animation function
    this.animation();

    // orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement); 

    //event handlers
    window.addEventListener("resize", this.handleWindowResize);
  }

  renderScene = () => {
    // Start rendering loop
    this.renderer.render(this.scene, this.camera);

    // Call renderScene recursively for continuous animation
    requestAnimationFrame(this.renderScene);
  };

  animation = () => {
    requestAnimationFrame(this.animation);
    this.cube.rotation.x += 0.001;
    this.cube.rotation.y += 0.001;
  };

  handleWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
  }

  render() {
    return <div ref={(ref) => (this.mount = ref)} />;
  }
}

export default ThreeScene;
