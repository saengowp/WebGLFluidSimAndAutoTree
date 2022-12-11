import * as THREE from "three";
import { TreeSegment } from "./TreeSegment";
import * as _ from "lodash";

export class TreeBranch {
  constructor(params) {
    const from = params.from;
    this.rotation = params.rotation;
    this.length = params.length;

    this.generation = params.generation || 0;
    this.generations = params.generations;

    this.uvLength = params.uvLength || 10.0;
    this.uvOffset = params.uvOffset || 0.0;
    this.radius = params.radius || 0.1;
    this.radiusSegments = params.radiusSegments;
    this.heightSegments = params.heightSegments;

    // Branch from TreeSegment
    if (from instanceof TreeSegment) {
      this.from = from;

      this.position = from.position
        .clone()
        .add(
          new THREE.Vector3(0, 1, 0).applyMatrix4(from.rotation).setLength(0.05)
        );
      // Branch from Position(Vector)
    } else if (from instanceof THREE.Vector3) {
      this.from = null;
      this.position = from;
    } else {
      console.warning("Branch Error: from argument is missing !");
    }

    // Define Branch Direction
    const direction = new THREE.Vector3(0, 1, 0).applyMatrix4(this.rotation);
    this.to = this.position.clone().add(direction.setLength(this.length));

    // Created Segments
    this.segments = this.buildTreeSegments(
      this.radius,
      this.radiusSegments,
      direction,
      this.heightSegments
    );

    // Init Children
    this.children = [];
  }

  buildTreeSegments(radius, radiusSegments, direction, heightSegments) {
    // Set direction
    const theta = Math.PI * 0.25;
    const h_theta = Math.PI * 0.5;
    const x = Math.random() * theta - h_theta;
    const z = Math.random() * theta - h_theta;
    let rot = new THREE.Matrix4();
    const euler = new THREE.Euler(x, 0, z);
    rot.makeRotationFromEuler(euler);
    direction.applyMatrix4(rot);

    // Make Curve
    const curveRatio = 0.2 * Math.random();
    const curvePoint = this.position
      .clone()
      .add(direction.setLength(this.length * curveRatio));
    const curve = new THREE.CatmullRomCurve3([
      this.position,
      curvePoint,
      this.to,
    ]);

    // Set Radius
    const fromRatio =
      this.generation == 0
        ? 1.0
        : 1.0 - this.generation / (this.generations + 1);
    const toRatio = 1.0 - (this.generation + 1) / (this.generations + 1);

    const fromRadius = radius * fromRatio;
    const toRadius = radius * toRatio;

    // Set Rotation
    const rotation = this.rotation;

    const uvLength = this.uvLength;
    let uvOffset = this.uvOffset;
    const points = curve.getPoints(heightSegments);

    // Add Offset if Not Root
    if (this.from !== null) {
      uvOffset += this.from.position.distanceTo(points[0]) / uvLength;
    }

    // Create Segments
    const segments = [];

    // First Segments
    segments.push(
      new TreeSegment(points[0], rotation, uvOffset, fromRadius, radiusSegments)
    );

    for (let i = 1; i < heightSegments; i++) {
      let p0 = points[i];
      let p1 = points[i + 1];

      let radiusRatio = i / (heightSegments - 1);
      let radius = fromRadius + (toRadius - fromRadius) * radiusRatio;
      let distance = p1.distanceTo(p0);
      uvOffset += distance / uvLength;

      let segment = new TreeSegment(
        p0,
        rotation,
        uvOffset,
        radius,
        radiusSegments
      );
      segments.push(segment);
    }

    return segments;
  }

  branch(spawner, count) {
    for (let i = 0; i < count; i++) {
      this.spawn(spawner, i == 0);
    }
    this.children.forEach((child) => {
      child.branch(spawner, count - 1);
    });
  }

  grow(spawner) {
    if (this.children.length <= 0) {
      this.branch(spawner, 1);
    } else {
      this.children.forEach((child) => {
        child.grow(spawner);
      });
    }
  }

  // Create Child
  spawn(spawner, extenstion) {
    const child = spawner.spawn(this, extenstion);
    this.children.push(child);
  }

  // Return All branch recursively
  branchlets() {
    if (this.children.length <= 0) {
      return this;
    } else {
      return Array.prototype.concat.apply(
        [],
        this.children.map(function (child) {
          return child.branchlets();
        })
      );
    }
  }

  // Length of all segments combined
  calculateLength() {
    let segments = this.segments;
    let length = 0;

    const n = segments.length - 1;
    // Add length from each segments
    for (let i = 0; i < n; i++) {
      let from = segments[i].position;
      let to = segments[i + 1].position;
      length += from.distanceTo(to);
    }

    return length;
  }

  // Get Leaf Positions
  getLeafPositions(leafPerBranch) {
    // Define leaf position
    let leafPositions = [];
    // Not from Root
    if (this.from !== null && this.generation >= this.generations - 1) {
      let vertices = [];
      for (let segment of this.segments.slice(1)) {
        vertices = vertices.concat(segment.vertices);
      }
      // sample leaf position from vertices
      leafPositions = _.sampleSize(vertices, leafPerBranch);
    }

    // Get Leaf from Children
    this.children.forEach((child) => {
      let childPos = child.getLeafPositions(leafPerBranch);
      leafPositions = leafPositions.concat(childPos);
    });

    return leafPositions;
  }
}
