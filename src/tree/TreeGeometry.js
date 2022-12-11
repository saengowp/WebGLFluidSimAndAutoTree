import * as THREE from "three";
import { Triangle, Vector3 } from "three";

export class TreeGeometry {
  build(tree) {
    const geometry = new THREE.BufferGeometry();
    this.vertices = [];
    this.uvs = [];
    this.faces = [];
    this.faceVertexUvs = [];
    this.normals = [];
    // Add Values to vertics, uvs, faces, faceVertexUvs
    this.buildBranches(tree.root);

    // Create Array for Geometry
    const postionsArray = [];
    const normsArray = [];
    const uvsArray = [];

    for (let f of this.faces) {
      postionsArray.push(...this.vertices[f]);
    }
    for (let norm of this.normals) {
      normsArray.push(...norm);
    }
    for (let fuvs of this.faceVertexUvs) {
      uvsArray.push(...fuvs);
    }

    // Set Attribute
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(postionsArray), 3)
    );
    geometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(new Float32Array(normsArray), 3)
    );
    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(uvsArray), 2)
    );
    // geometry.setIndex(this.faces);
    geometry.computeVertexNormals();

    return geometry;
  }

  buildBranches(branch) {
    // Segments proberty
    const radiusSegments = branch.radiusSegments;
    const heightSegments = branch.segments.length - 1;

    var vertices = [];
    const faces = [];
    const faceVertexUvs = [];
    const normals = [];

    const indices = [];
    const uvs = [];

    let index = 0;
    let norm;
    const offset = this.vertices.length;

    // Push Index for each segment
    for (let j = 0; j <= heightSegments; j++) {
      let indicesRow = [];

      let segment = branch.segments[j];

      vertices = vertices.concat(segment.vertices);
      uvs.push(segment.uvs);

      for (let i = 0; i <= radiusSegments; i++) {
        indicesRow.push(index++);
      }

      indices.push(indicesRow);
    }
    // Define to calculate normal
    const calNormal = (v1, v2, v3) => {
      let norm = new Vector3();
      let triangle = new Triangle(
        this.vertices[v1],
        this.vertices[v2],
        this.vertices[v3]
      );
      triangle.getNormal(norm);
      return norm;
    };

    // Add Faces , UVs and Normal
    for (let i = 0; i < radiusSegments; i++) {
      for (let j = 0; j < heightSegments; j++) {
        // Define Index
        let ci = i;
        let ni = i + 1;
        let cj = j;
        let nj = j + 1;

        let v1 = indices[cj][ci] + offset;
        let v2 = indices[nj][ci] + offset;
        let v3 = indices[nj][ni] + offset;
        let v4 = indices[cj][ni] + offset;

        let uv1 = uvs[cj][ci];
        let uv2 = uvs[nj][ci];
        let uv3 = uvs[nj][ni];
        let uv4 = uvs[cj][ni];

        faces.push(v1, v4, v2);
        faceVertexUvs.push(uv1, uv4, uv2);
        norm = calNormal(v1, v4, v2);
        normals.push(norm, norm, norm);

        faces.push(v2, v4, v3);
        faceVertexUvs.push(uv2, uv4, uv3);
        norm = calNormal(v2, v4, v3);
        normals.push(norm, norm, norm);
      }
    }

    // Special Case for Root
    if (branch.from === null) {
      const bottom = branch.segments[0];
      vertices.push(bottom.position);
      indices.push(index++);

      let y = 0;

      for (let x = 0; x < radiusSegments; x++) {
        let v1 = indices[y][x] + offset;
        let v2 = indices[y][x + 1] + offset;
        let v3 = index - 1 + offset;

        let uv1 = uvs[y][x];
        let uv2 = uvs[y][x + 1];
        let uv3 = new THREE.Vector2(uv2.x, branch.uvOffset);

        faces.push(v1, v3, v2);
        faceVertexUvs.push(uv1, uv3, uv2);
        norm = calNormal(v1, v3, v2);
        normals.push(norm, norm, norm);
      }
      // Otherwise
    } else {
      const from = branch.from;
      let y = 0;

      vertices = vertices.concat(from.vertices);

      var bottomIndices = [];
      for (var x = 0; x <= radiusSegments; x++) {
        bottomIndices.push(index++ + offset);
      }

      for (var x = 0; x < radiusSegments; x++) {
        var v0 = indices[y][x] + offset;
        var v1 = indices[y][x + 1] + offset;
        var v2 = bottomIndices[x];
        var v3 = bottomIndices[x + 1];

        var uv0 = uvs[y][x];
        var uv1 = uvs[y][x + 1];
        var uv2 = from.uvs[x];
        var uv3 = from.uvs[x + 1];

        faces.push(v0, v3, v1);
        faceVertexUvs.push(uv0, uv3, uv1);
        norm = calNormal(v0, v3, v1);
        normals.push(norm, norm, norm);

        faces.push(v0, v2, v3);
        faceVertexUvs.push(uv0, uv2, uv3);
        norm = calNormal(v0, v2, v3);
        normals.push(norm, norm, norm);
      }
    }
    // const verticeArray = [];
    // const uvsArray = [];
    // const facesArray = [];
    // for (let v of vertices) {
    //   verticeArray.push(v);
    // }
    // for (let uv of uvs) {
    //   uvsArray.push(uv);
    // }

    this.vertices = this.vertices.concat(vertices);
    this.uvs = this.uvs.concat(uvs);
    this.faces = this.faces.concat(faces);
    this.faceVertexUvs = this.faceVertexUvs.concat(faceVertexUvs);
    this.normals = this.normals.concat(normals);
    // geometry.faces = geometry.faces.concat(faces);
    // geometry.faceVertexUvs[0] = geometry.faceVertexUvs[0].concat(faceVertexUvs);

    // Set Attribute
    const self = this;
    branch.children.forEach((child) => {
      self.buildBranches(child);
    });
  }

  buildLineStrips(tree) {
    const vertices = [];

    const recur = (branch) => {
      const segments = branch.segments;
      const n = segments.length;
      for (let i = 0; i < n - 1; i++) {
        let s0 = segments[i].position;
        let s1 = segments[i + 1].position;
        vertices.push(...s0, ...s1);
        // vertices.push(...s0);
      }

      branch.children.forEach((child) => {
        recur(child);
      });
    };
    recur(tree.root);

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );
    return geometry;
  }

  calculateLength(tree) {
    return this.calculateSegmentLength(tree.root);
  }

  calculateSegmentLength(branch) {
    const self = this;

    // Find Longest Children Length
    let longest = 0.0;
    branch.children.forEach((child) => {
      let len = self.calculateSegmentLength(child);
      longest = Math.max(longest, len);
    });

    // Longest Children + It's length
    return longest + branch.calculateLength();
  }
}
