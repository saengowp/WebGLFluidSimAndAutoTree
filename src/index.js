import * as THREE from 'three';
import "./style.css";
import diffuseShader from "raw-loader!./diffuse.glsl";
import advectShader from "raw-loader!./advect.glsl";
import * as dat from 'dat.gui';

// UI
const gui = new dat.GUI();
const controlData = {
};

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
const clearMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
const diffuseMaterial = new THREE.ShaderMaterial({
    fragmentShader: diffuseShader,
    uniforms: {
        previous: {
            type: "t",
            value: bufferA.texture,
        },
        screenSize: {
            type: 'v2',
            value: new THREE.Vector2(width, height)
        },
        gen: {
            type: 'v2',
            //value: controlData.enableGen,
            value: new THREE.Vector2(-1.0, -1.0)
        },
        dt: {
            type: 'float',
            value: 1.0,
        }
    }
})
const advectMaterial = new THREE.ShaderMaterial({
    fragmentShader: advectShader,
    uniforms: {
        previous: {
            type: "t",
            value: bufferA.texture,
        },
        screenSize: {
            type: 'v2',
            value: new THREE.Vector2(width, height)
        },
        dt: {
            type: 'float',
            value: 1.0,
        }
    }
})

let genDragActive = false;

document.addEventListener("mousedown", e => {
    genDragActive = true;
    diffuseMaterial.uniforms.gen.value = new THREE.Vector2(e.clientX, height-e.clientY);
})
document.addEventListener("mouseup", e => {
    diffuseMaterial.uniforms.gen.value = new THREE.Vector2(-1.0, -1.0);
    genDragActive = false;
})

document.addEventListener("mousemove", e => {
    if (genDragActive) {
        diffuseMaterial.uniforms.gen.value = new THREE.Vector2(e.clientX, height-e.clientY);
    }
})



//gui.add(controlData, 'enableGen', 0, 1, 1).onChange(e => material.uniforms.enableGen.value = e == 1);

const mesh = new THREE.Mesh(geometry, diffuseMaterial);
const bufferScene =  new THREE.Scene()
bufferScene.add(mesh);

controlData.clearBuffer = function () {
   const temp = mesh.material;
   mesh.material = clearMaterial;
   renderer.setRenderTarget(bufferB);
   renderer.render(bufferScene, camera);
   mesh.material = temp;
}
gui.add(controlData, 'clearBuffer');

//const displayMaterial = new THREE.MeshBasicMaterial({map: texA});
const displayMaterial = new THREE.MeshBasicMaterial({map: bufferA.texture});
const displayMesh = new THREE.Mesh(geometry, displayMaterial);
scene.add(displayMesh);

let f = false;
let lastFrame = 0;

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    const dt = performance.now()/1000 - lastFrame;
    lastFrame = performance.now()/1000;

    // Diffuse Density
    for (let i = 0; i < 20; i++) {
        [bufferA, bufferB] = [bufferB, bufferA];
        diffuseMaterial.uniforms.previous.value = bufferA.texture;
        diffuseMaterial.uniforms.dt.value = dt;
        mesh.material = diffuseMaterial; 
        renderer.setRenderTarget(bufferB);
        renderer.render(bufferScene, camera);
    }

    // Advect Density
    [bufferA, bufferB] = [bufferB, bufferA];
    advectMaterial.uniforms.previous.value = bufferA.texture;
    advectMaterial.uniforms.dt.value = dt;
    mesh.material = advectMaterial; 
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
}

// DOM Insertion and Start Render Loop
document.body.appendChild(renderer.domElement);
animate()