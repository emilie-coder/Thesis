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

// Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    this.scene.add(ambientLight)

    // texture loader 
    const loader = new THREE.TextureLoader()
    const texture = loader.load('https://cdn.mos.cms.futurecdn.net/yCPyoZDQBBcXikqxkeW2jJ-1920-80.jpg.webp')

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping


    // the board

    const material2 = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide
     })

    const planeSize = 2;
    const geometry2 = new THREE.PlaneGeometry(planeSize, planeSize)
    const board = new THREE.Mesh(geometry2, material2)
    board.position.set(0, 0, 0)
    this.scene.add(board)



    // Call the render function
    this.renderScene();

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
