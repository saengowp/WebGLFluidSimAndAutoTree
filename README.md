## Tree Usage

```javascript
// Import
import { Tree } from "./tree/Tree";
import { TreeGeometry } from "./tree/TreeGeometry";

// Generate Tree
const tree = new THREE.Tree({
  generations: 4, // # for branch' hierarchy
  length: 4.0, // length of root branch
  uvLength: 16.0, // uv.v ratio against geometry length (recommended is generations * length)
  radius: 0.2, // radius of root branch
  radiusSegments: 8, // # of radius segments for each branch geometry
  heightSegments: 8, // # of height segments for each branch geometry
});

// Build Geometry
const treeGeometry = new TreeGeometry();
const geometry = treeGeometry.build(tree);
const material = new THREE.MeshBasicMaterial();
const mesh = new THREE.Mesh(geometry, material);

// Add to scene
scene.add(mesh);

// Get Leaf Position
const leafPerBranch = 10;
const leafPos = tree.getLeafPositions(leafPerBranch);
```
