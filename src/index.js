import * as THREE from 'three';
import "./style.css"

const scene = new THREE.Scene();
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

document.body.appendChild(renderer.domElement);
animate()