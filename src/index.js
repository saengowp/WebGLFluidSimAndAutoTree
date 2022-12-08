import * as THREE from 'three';
import "./style.css";
import testShaderCode from "raw-loader!./test.glsl";

// Setup Scene and Renderer
const scene = new THREE.Scene();
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 1, 1000);
camera.position.z = 2;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    //2 Triangle
    -width/2, -height/2,  1.0,
	 width/2, -height/2,  1.0,
	 width/2,  height/2,  1.0,

	 width/2,  height/2,  1.0,
	-width/2,  height/2,  1.0,
	-width/2, -height/2,  1.0,
    ]),
    3)
)
const material = new THREE.ShaderMaterial({
    fragmentShader: testShaderCode
})
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// DOM Insertion and Start Render Loop
document.body.appendChild(renderer.domElement);
animate()