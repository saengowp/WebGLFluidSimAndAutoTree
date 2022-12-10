import * as THREE from 'three';
import "./style.css";
import diffuseShader from "raw-loader!./diffuse.glsl";
import advectShader from "raw-loader!./advect.glsl";
import projectDiv from "raw-loader!./project-div.glsl";
import projectSolveP from "raw-loader!./project-solvep.glsl";
import projectApply from "raw-loader!./project-apply.glsl";
import displayShader from "raw-loader!./display.glsl";
import windShader from "raw-loader!./wind.glsl";
import * as dat from 'dat.gui';

// UI
const gui = new dat.GUI();
const controlData = {
    channel: 0,
    windX: 0,
    windY: 0,
    boyance: false,
};

// Setup Scene and Renderer
const scene = new THREE.Scene();
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 1, 1000);
camera.position.z = 2;
const renderer = new THREE.WebGLRenderer();
renderer.getContext().getExtension('OES_texture_float');
renderer.setSize(width, height);

const geometry = new THREE.PlaneGeometry(width, height);


const testTex = new THREE.TextureLoader().load("test.jpg")
let bufferA = new THREE.WebGLRenderTarget(width, height, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType});
let bufferB = new THREE.WebGLRenderTarget(width, height, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType});
let divB = new THREE.WebGLRenderTarget(width, height, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType});

const testMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
const clearMaterial = new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.0});
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
        },
        
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
        },
        
    }
})

const projectMaterials = []
for (const program of [projectDiv, projectSolveP, projectApply]) {
    const shader = new THREE.ShaderMaterial({
        fragmentShader: program,
        uniforms: {
            previous: {
                type: "t",
                value: bufferA.texture,
            },
            div: {
                type: "t",
                value: divB.texture,
            },
            screenSize: {
                type: 'v2',
                value: new THREE.Vector2(width, height)
            },
        }
    })
    projectMaterials.push(shader);
}

const windMaterial = new THREE.ShaderMaterial({
    fragmentShader: windShader,
    uniforms: {
        previous: {
            type: "t",
            value: bufferA.texture,
        },
        screenSize: {
            type: 'v2',
            value: new THREE.Vector2(width, height)
        },
        wind: {
            type: 'v2',
            value: new THREE.Vector2(0, 0),
        },
        boyance: {
            type: 'bool',
            value: false,
        },
        dt: {
            type: 'float',
            value: 0,
        }
    }
})

gui.add(controlData, "windX", -100, 100).onChange(e => windMaterial.uniforms.wind.value.x = e);
gui.add(controlData, "windY", -100, 100).onChange(e => {windMaterial.uniforms.wind.value.y = e;});
gui.add(controlData, "boyance").onChange(e => windMaterial.uniforms.boyance.value = e);


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
// const displayMaterial = new THREE.MeshBasicMaterial({map: bufferA.texture});
const displayMaterial = new THREE.ShaderMaterial({
    fragmentShader: displayShader,
    uniforms: {
        previous: {
            type: 't',
            value: bufferA.texture
        },
        screenSize: {
            type: 'v2',
            value: new THREE.Vector2(width, height)
        },
        ch: {
            type: 'int',
            value: 0,
        }
    }
});

gui.add(controlData, "channel", 0, 3, 1).onChange(v => displayMaterial.uniforms.ch.value = v);
const displayMesh = new THREE.Mesh(geometry, displayMaterial);
scene.add(displayMesh);

let f = false;
let lastFrame = 0;

controlData["runSimulation"] = true;
gui.add(controlData, "runSimulation");


// Render Loop
function animate() {
    requestAnimationFrame(animate);

    if (!controlData.runSimulation) {
        renderer.setRenderTarget(null);
        displayMesh.material.map = bufferB.texture;
        renderer.render(scene, camera)
        return;
    }
    const dt = performance.now()/1000 - lastFrame;
    lastFrame = performance.now()/1000;

    // Diffuse
    for (let i = 0; i < 20; i++) {
        [bufferA, bufferB] = [bufferB, bufferA];
        diffuseMaterial.uniforms.previous.value = bufferA.texture;
        diffuseMaterial.uniforms.dt.value = dt;
        mesh.material = diffuseMaterial; 
        renderer.setRenderTarget(bufferB);
        renderer.render(bufferScene, camera);
    }

    // Advect
    [bufferA, bufferB] = [bufferB, bufferA];
    advectMaterial.uniforms.previous.value = bufferA.texture;
    advectMaterial.uniforms.dt.value = dt;
    mesh.material = advectMaterial; 
    renderer.setRenderTarget(bufferB);
    renderer.render(bufferScene, camera);

    // Project Div
    projectMaterials[0].uniforms.previous.value = bufferB.texture;
    mesh.material = projectMaterials[0];
    renderer.setRenderTarget(divB);
    renderer.render(bufferScene, camera);

    // Project SolveP
    for (let i = 0; i < 20; i++) {
        [bufferA, bufferB] = [bufferB, bufferA];
        projectMaterials[1].uniforms.previous.value = bufferA.texture;
        mesh.material = projectMaterials[1];
        renderer.setRenderTarget(bufferB);
        renderer.render(bufferScene, camera);
    }

    // Project Apply
    [bufferA, bufferB] = [bufferB, bufferA];
    projectMaterials[2].uniforms.previous.value = bufferA.texture;
    mesh.material = projectMaterials[2];
    renderer.setRenderTarget(bufferB);
    renderer.render(bufferScene, camera);

    // Project Apply
    [bufferA, bufferB] = [bufferB, bufferA];
    windMaterial.uniforms.previous.value = bufferA.texture;
    windMaterial.uniforms.dt.value = dt;
    mesh.material = windMaterial;
    renderer.setRenderTarget(bufferB);
    renderer.render(bufferScene, camera);

    // Display
    renderer.setRenderTarget(null);
    displayMaterial.uniforms.previous.value = bufferB.texture;
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