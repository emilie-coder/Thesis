import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class ThreeScene extends Component {
  componentDidMount() {
    // scene
    this.scene = new THREE.Scene();

    // renderer
    this.renderer = new THREE.WebGLRenderer();
    this.mount.appendChild(this.renderer.domElement);

    // camera
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.camera.position.z = 5;

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    // texture loader
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      "https://cdn.mos.cms.futurecdn.net/yCPyoZDQBBcXikqxkeW2jJ-1920-80.jpg.webp"
    );

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    // the board
    const material2 = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    const planeSize = 2;
    const geometry2 = new THREE.PlaneGeometry(planeSize, planeSize);
    const board = new THREE.Mesh(geometry2, material2);
    board.position.set(0, 0, 0);
    this.scene.add(board);

    // Call the render function
    this.renderScene();

    // orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // event handlers
    window.addEventListener("resize", this.handleWindowResize);
  }

  resizeCanvasToDisplaySize = () => {
    const canvas = this.renderer.domElement;
    const container = canvas.parentElement; // Get the parent div container
    const width = container.clientWidth; // Use container width
    const height = container.clientHeight; // Use container height

    if (canvas.width !== width || canvas.height !== height) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  };

  renderScene = () => {
    // Start rendering loop
    this.resizeCanvasToDisplaySize();
    this.renderer.render(this.scene, this.camera);

    // Call renderScene recursively for continuous animation
    requestAnimationFrame(this.renderScene);
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
  }

  animate = (time) => {
    time *= 0.001; // seconds

    // Update rotation or any other animations here
    // For example, board.rotation.x = time * 0.5;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  };

  render() {
    return <div ref={(ref) => (this.mount = ref)} style={{ width: "100%", height: "100%" }} />;
  }
}

export default ThreeScene;
