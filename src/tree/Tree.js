import * as THREE from "three";
import { TreeSpawner } from "./TreeSpawner";
import { TreeBranch } from "./TreeBranch";

export class Tree {
  constructor(params, spawner) {
    params = params || {};
    const from = params.from || new THREE.Vector3();
    let rotation = new THREE.Matrix4();

    // Set Rotation
    if (params.rotation) {
      if (params.rotation instanceof THREE.Euler) {
        const euler = params.rotation;
        rotation.makeRotationFromEuler(euler);
      } else if (params.rotation instanceof THREE.Matrix4) {
        rotation = params.rotation;
      }
    }

    // Get Values from params
    const length = params.length || 3.0;
    const uvLength = params.uvLength || 10.0;
    const radius = params.radius || 0.1;

    // Set Segments of Tree
    this.radiusSegments = params.radiusSegments || 8;
    this.heightSegments = params.heightSegments || 8;

    // Set number of generations
    const generations =
      params.generations !== undefined ? params.generations : 5;
    this.generations = generations;

    // Init root
    this.root = new TreeBranch({
      from: from,
      rotation: rotation,
      length: length,
      uvLength: uvLength,
      generation: 0,
      generations: this.generations,
      radius: radius,
      radiusSegments: this.radiusSegments,
      heightSegments: this.heightSegments,
    });

    // Init Spawner
    this.spawner = spawner || new TreeSpawner();

    // Branch the tree from root
    this.root.branch(this.spawner, this.generations);
  }

  grow(count, spawner) {
    spawner = spawner || this.spawner;
    this.generation++;
    this.root.grow(spawner, count);
  }

  branchlets() {
    return this.root.branchlets;
  }
}
