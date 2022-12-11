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
import * as _ from 'lodash';


// UI
const gui = new dat.GUI();
const controlData = {
    channel: 0,
    windX: 0,
    windY: 0,
    boyance: true,
    treeEmitter: true,
};

// Setup Scene and Renderer
const scene = new THREE.Scene();
const simFac = 2;
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const width = screenWidth/simFac;
const height = screenHeight/simFac;
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
            value: controlData.boyance,
        },
        dt: {
            type: 'float',
            value: 0,
        },
        clear: {
            type: 'bool',
            value: false,
        },
        gen: {
            type: 'v2',
            //value: controlData.enableGen,
            value: new THREE.Vector2(-1.0, -1.0)
        },
        genVel: {
            type: 'v2',
            value: new THREE.Vector2(0.0, 0.0)
        }
    }
})

gui.add(controlData, "windX", -1000, 1000).onChange(e => windMaterial.uniforms.wind.value.x = e);
gui.add(controlData, "windY", -1000, 1000).onChange(e => {windMaterial.uniforms.wind.value.y = e;});
gui.add(controlData, "boyance").onChange(e => windMaterial.uniforms.boyance.value = e);


let genDragActive = false;

document.addEventListener("mousedown", e => {
    genDragActive = true;
    windMaterial.uniforms.genVel.value = new THREE.Vector2(0, 0);
    windMaterial.uniforms.gen.value = new THREE.Vector2(e.clientX/simFac, (screenHeight-e.clientY)/simFac);
})
document.addEventListener("mouseup", e => {
    windMaterial.uniforms.gen.value = new THREE.Vector2(-1.0, -1.0);
    genDragActive = false;
})

document.addEventListener("mousemove", e => {
    if (genDragActive) {
        const newSrc = new THREE.Vector2(e.clientX/simFac, (screenHeight-e.clientY)/simFac);
        const oldSrc = windMaterial.uniforms.gen.value;
        windMaterial.uniforms.genVel.value = new THREE.Vector2((newSrc.x - oldSrc.x) * 10, (newSrc.y - oldSrc.y) * 10);
        windMaterial.uniforms.gen.value = newSrc;
    }
})



//gui.add(controlData, 'enableGen', 0, 1, 1).onChange(e => material.uniforms.enableGen.value = e == 1);

const mesh = new THREE.Mesh(geometry, diffuseMaterial);
const bufferScene =  new THREE.Scene()
bufferScene.add(mesh);

controlData.clearBuffer = function () {
   const temp = mesh.material;
   mesh.material = windMaterial;
   windMaterial.uniforms.clear.value = true;
   renderer.setRenderTarget(bufferB);
   renderer.render(bufferScene, camera);
   mesh.material = temp;
   windMaterial.uniforms.clear.value = false;
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
            value: new THREE.Vector2(screenWidth, screenHeight)
        },
        ch: {
            type: 'int',
            value: 0,
        }
    },
    transparent: true,
});

gui.add(controlData, "channel", 0, 3, 1).onChange(v => displayMaterial.uniforms.ch.value = v);
const displayMesh = new THREE.Mesh(geometry, displayMaterial);
scene.add(displayMesh);

let lastFrame = 0;

controlData["runSimulation"] = true;
gui.add(controlData, "runSimulation");

// Tree
// Import
import { Tree } from "./tree/Tree";
import { TreeGeometry } from "./tree/TreeGeometry";
import { BufferGeometry, PointsMaterial } from 'three';

// Generate Tree
const tree = new Tree({
generations: 4, // # for branch' hierarchy
length: 4.0, // length of root branch
uvLength: 16.0, // uv.v ratio against geometry length (recommended is generations * length)
radius: 0.2, // radius of root branch
radiusSegments: 8, // # of radius segments for each branch geometry
heightSegments: 8, // # of height segments for each branch geometry
});

// Build Geometry
const treeGeometry = new TreeGeometry();
const treeMaterializedGeometry = treeGeometry.build(tree);
const treeMaterial = new THREE.MeshBasicMaterial();
const treeMesh = new THREE.Mesh(treeMaterializedGeometry, treeMaterial);

// Add to scene
const treeCamFac = Math.max(5.0/width, 20.0/height);
const treeCamera = new THREE.OrthographicCamera(-width*treeCamFac/2, width*treeCamFac/2, height*treeCamFac, 0, 100, -100);
const treeScene = new THREE.Scene();
treeScene.add(treeMesh);

// Get Leaf Position
const leafPerBranch = 1;
const leafPos = tree.getLeafPositions(leafPerBranch);

console.log(treeCamera)
const leafPosArr = leafPos.flatMap(e => {
    e = e.clone()
    e.project(treeCamera)
    e.x *= width/2;
    e.y *= height/2;
    return [e.x, e.y]
});
console.log(leafPosArr)

// End Tree

const treePointsGeom = new THREE.BufferGeometry()
treePointsGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(leafPosArr), 2));
const treePoints = new THREE.Points(treePointsGeom, new PointsMaterial({size: 5, color: 0xFFFFFF, opacity: 0.1, transparent: true}));
treePoints.visible = false;
bufferScene.add(treePoints);

gui.add(controlData, "treeEmitter");




// Render Loop
function animate() {
    requestAnimationFrame(animate);

    renderer.setSize(width, height);

    if (!controlData.runSimulation) {
        renderer.setSize(screenWidth, screenHeight);
        renderer.setRenderTarget(null);
        displayMesh.material.map = bufferB.texture;
        renderer.render(scene, camera)
        return;
    }
    const dt = performance.now()/1000 - lastFrame;
    lastFrame = performance.now()/1000;

    // Wind Apply
    [bufferA, bufferB] = [bufferB, bufferA];
    windMaterial.uniforms.previous.value = bufferA.texture;
    windMaterial.uniforms.dt.value = dt;
    mesh.material = windMaterial;
    if (controlData.treeEmitter) {
        treePoints.visible = true;
    }
    renderer.setRenderTarget(bufferB);
    renderer.render(bufferScene, camera);
    treePoints.visible = false;

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

    // Display

    
    renderer.setSize(screenWidth, screenHeight);
    renderer.setRenderTarget(null);
    displayMaterial.uniforms.previous.value = bufferB.texture;


    renderer.render(treeScene, treeCamera);

    renderer.autoClear = false;
    renderer.clearDepth();

    renderer.render(scene, camera)
    renderer.autoClear = true;
}


// DOM Insertion and Start Render Loop
document.body.appendChild(renderer.domElement);
animate()