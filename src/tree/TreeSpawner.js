import * as THREE from "three";
import { TreeBranch } from "./TreeBranch";

export class TreeSpawner {
  constructor(params) {
    params = params || {};

    this.theta = params.theta || Math.PI * 0.5;
    this.attenuation = params.attenuation || 0.75;
    this.rootRange = params.rootRange || new THREE.Vector2(0.75, 1.0);
  }

  spawn(branch, extenstion) {
    const theta = this.theta;
    const attenuation = this.attenuation;

    const h_theta = theta * 0.5;
    const x = Math.random() * theta - h_theta;
    const z = Math.random() * theta - h_theta;

    const length = branch.length * attenuation;

    let rotation = new THREE.Matrix4();
    const euler = new THREE.Euler(x, 0, z);
    rotation.makeRotationFromEuler(euler);
    rotation.multiply(branch.rotation);

    // Select Segment to Extend
    let segmentIdx;
    extenstion = extenstion || false;
    if (extenstion) {
      // Extend on Last segment
      segmentIdx = branch.segments.length - 1;
    } else {
      // Random Extend from Middle Segment
      segmentIdx = Math.floor(
        (Math.random() * (this.rootRange.y - this.rootRange.x) +
          this.rootRange.x) *
          branch.segments.length
      );
    }
    const segment = branch.segments[segmentIdx];

    // Create new Branch
    return new TreeBranch({
      from: segment,
      rotation: rotation,
      length: length,
      uvOffset: segment.uvOffset,
      uvLength: branch.uvLength,
      generation: branch.generation + 1,
      generations: branch.generations,
      radius: branch.radius,
      radiusSegments: branch.radiusSegments,
      heightSegments: branch.heightSegments,
    });
  }
}
