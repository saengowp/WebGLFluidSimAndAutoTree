import * as THREE from 'three';
import "./style.css";
import testShaderCode from "raw-loader!./test.glsl";
import { PlaneGeometry, Scene } from 'three';

// Setup Scene and Renderer
const scene = new THREE.Scene();
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 1, 1000);
camera.position.z = 2;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

const geometry = new THREE.PlaneGeometry(width, height);


const testTex = new THREE.TextureLoader().load("test.jpg")
let bufferA = new THREE.WebGLRenderTarget(width, height, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
let bufferB = new THREE.WebGLRenderTarget(width, height, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

const testMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
const material = new THREE.ShaderMaterial({
    fragmentShader: testShaderCode,
    uniforms: {
        previous: {
            type: "t",
            value: bufferA.texture,
        },
        screenSize: {
            type: 'v2',
            value: new THREE.Vector2(width, height)
        }
    }
})
const mesh = new THREE.Mesh(geometry, material);
const bufferScene =  new Scene()
bufferScene.add(mesh);

//const displayMaterial = new THREE.MeshBasicMaterial({map: texA});
const displayMaterial = new THREE.MeshBasicMaterial({map: bufferA.texture});
const displayMesh = new THREE.Mesh(geometry, displayMaterial);
scene.add(displayMesh);

let f = false;

// Render Loop
function animate() {
    [bufferA, bufferB] = [bufferB, bufferA];
    material.uniforms.previous.value = bufferA.texture;
    renderer.setRenderTarget(bufferB);
    renderer.render(bufferScene, camera);

    renderer.setRenderTarget(null);
    displayMesh.material.map = bufferB.texture;
    renderer.render(scene, camera)

    if (!f) {
        console.log(renderer.info);
        console.log({width, height});
        f = true;
    }
    requestAnimationFrame(animate);
}

// DOM Insertion and Start Render Loop
document.body.appendChild(renderer.domElement);
animate()