import * as THREE from "three";

export class TreeSegment {
  constructor(position, rotation, uvOffset, radius, radiusSegments) {
    this.position = position;
    this.rotation = rotation;
    this.uvOffset = uvOffset;
    this.radius = radius;

    this.vertices = [];
    this.uvs = [];

    this.build(radius, radiusSegments);
  }

  build(radius, radiusSegments) {
    const thetaLength = Math.PI * 2;
    for (let i = 0; i <= radiusSegments; i++) {
      let u = i / radiusSegments;
      let vertex = new THREE.Vector3(
        radius * Math.sin(u * thetaLength),
        0,
        radius * Math.cos(u * thetaLength)
      )
        .applyMatrix4(this.rotation)
        .add(this.position);

      this.vertices.push(vertex);
      this.uvs.push(new THREE.Vector2(u, this.uvOffset));
    }
  }
}
