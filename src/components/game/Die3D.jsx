import React, { useRef, useEffect } from "react";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Rounded-box geometry helper (pure JS, no external dep)
// Creates a box with smooth rounded edges, similar to a real gaming die.
// ---------------------------------------------------------------------------
function createRoundedBoxGeometry(width, height, depth, radius, segments = 4) {
  // We build the geometry via a lathe/extrusion-free approach using
  // THREE.BufferGeometry constructed from a subdivided box where corner
  // vertices are pushed to a sphere of `radius`.
  const shape = new THREE.Shape();
  const r = radius;
  const w = width / 2 - r;
  const h = height / 2 - r;

  // Use a sphere-projected cube approach via IcosahedronGeometry subdivision.
  // Simpler: use BoxGeometry with high segments + vertex shader push — 
  // but cleanest is manual rounded-box via THREE.BufferGeometry.
  // We'll use the well-known "RoundedBoxGeometry" algorithm inline.

  const geometry = new THREE.BufferGeometry();

  const rs = Math.max(1, Math.round(segments));
  const ws = 1, hs = 1, ds = 1; // box segments per side

  // Helper: create rounded box using Three.js ExtrudeGeometry approach
  // Actually, let's use the cleanest known approach: vertex displacement on a subdivided box.

  // Build via a grid-based approach: divide each face into a grid,
  // then round corners by clamping + normalizing the overshoot.
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // We'll subdivide each face of the box. For each face, map a 2D grid,
  // then compute the 3D position with rounded edges/corners.

  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;

  function roundedBoxVertex(x, y, z) {
    // Clamp to inner cube, then add direction * radius
    const ix = Math.max(-hw + r, Math.min(hw - r, x));
    const iy = Math.max(-hh + r, Math.min(hh - r, y));
    const iz = Math.max(-hd + r, Math.min(hd - r, z));
    const dx = x - ix;
    const dy = y - iy;
    const dz = z - iz;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len === 0) return [ix, iy, iz, 0, 0, 1];
    const scale = r / len;
    return [
      ix + dx * scale,
      iy + dy * scale,
      iz + dz * scale,
      dx / len,
      dy / len,
      dz / len,
    ];
  }

  const N = rs + 1; // grid points per edge
  let vertIndex = 0;

  // Face builder: provide a function that maps (u,v) in [0,1]² -> (x,y,z) raw
  function buildFace(mapFn, uMin, uMax, vMin, vMax) {
    const base = vertIndex;
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const v = j / N;
        const [rx, ry, rz] = mapFn(u, v);
        const [px, py, pz, nx, ny, nz] = roundedBoxVertex(rx, ry, rz);
        positions.push(px, py, pz);
        normals.push(nx, ny, nz);
        const uu = uMin + u * (uMax - uMin);
        const vv = vMin + v * (vMax - vMin);
        uvs.push(uu, vv);
        vertIndex++;
      }
    }
    const stride = N + 1;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const a = base + j * stride + i;
        const b = base + j * stride + i + 1;
        const c = base + (j + 1) * stride + i;
        const d = base + (j + 1) * stride + i + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }
  }

  // +Z face (front, face value shown toward camera)
  buildFace((u, v) => [
    -hw + u * width,
    -hh + v * height,
    hd,
  ], 0, 1, 0, 1);

  // -Z face (back)
  buildFace((u, v) => [
    hw - u * width,
    -hh + v * height,
    -hd,
  ], 0, 1, 0, 1);

  // +Y face (top)
  buildFace((u, v) => [
    -hw + u * width,
    hh,
    hd - v * depth,
  ], 0, 1, 0, 1);

  // -Y face (bottom)
  buildFace((u, v) => [
    -hw + u * width,
    -hh,
    -hd + v * depth,
  ], 0, 1, 0, 1);

  // +X face (right)
  buildFace((u, v) => [
    hw,
    -hh + v * height,
    hd - u * depth,
  ], 0, 1, 0, 1);

  // -X face (left)
  buildFace((u, v) => [
    -hw,
    -hh + v * height,
    -hd + u * depth,
  ], 0, 1, 0, 1);

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

// ---------------------------------------------------------------------------
// Pip layout for each face (standard Western die orientation)
// Positions are in die-face space: [0,1]² where (0,0)=bottom-left
// ---------------------------------------------------------------------------
const PIP_LAYOUTS = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.75], [0.75, 0.25]],
  3: [[0.25, 0.75], [0.5, 0.5], [0.75, 0.25]],
  4: [[0.25, 0.75], [0.75, 0.75], [0.25, 0.25], [0.75, 0.25]],
  5: [[0.25, 0.75], [0.75, 0.75], [0.5, 0.5], [0.25, 0.25], [0.75, 0.25]],
  6: [[0.25, 0.75], [0.75, 0.75], [0.25, 0.5], [0.75, 0.5], [0.25, 0.25], [0.75, 0.25]],
};

// Standard die: opposite faces sum to 7
// Face material order for BoxGeometry-style: +X, -X, +Y, -Y, +Z, -Z
// We want `value` on front (+Z = index 4), back = 7-value
function getFaceValues(frontValue) {
  const back = 7 - frontValue;
  const remaining = [1, 2, 3, 4, 5, 6].filter(v => v !== frontValue && v !== back);
  // [+X(right), -X(left), +Y(top), -Y(bottom), +Z(front), -Z(back)]
  return [remaining[0], remaining[1], remaining[2], remaining[3], frontValue, back];
}

// ---------------------------------------------------------------------------
// Build a canvas texture for one face with pips drawn on it
// ---------------------------------------------------------------------------
function makeFaceTexture(faceValue, dieColor, pipColor) {
  const S = 512;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");

  // Die face background — smooth white with very subtle gradient for depth
  const grad = ctx.createRadialGradient(S * 0.38, S * 0.35, S * 0.05, S * 0.5, S * 0.5, S * 0.72);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(1, "#dde0e8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  // Draw pips
  const pips = PIP_LAYOUTS[faceValue] || [];
  // 2mm pip on 16mm die = 2/16 = 12.5% of face width
  const pipR = S * 0.065; // radius in canvas px

  pips.forEach(([u, v]) => {
    const cx = u * S;
    const cy = (1 - v) * S; // flip Y

    // Pip indentation shadow (dark outer ring)
    const pipGrad = ctx.createRadialGradient(cx - pipR * 0.25, cy - pipR * 0.25, pipR * 0.05, cx, cy, pipR);
    pipGrad.addColorStop(0, "#1a1a2e");
    pipGrad.addColorStop(0.6, "#0d0d1a");
    pipGrad.addColorStop(1, "#000005");
    ctx.beginPath();
    ctx.arc(cx, cy, pipR, 0, Math.PI * 2);
    ctx.fillStyle = pipGrad;
    ctx.fill();

    // Subtle inner highlight on pip
    const highlight = ctx.createRadialGradient(cx - pipR * 0.3, cy - pipR * 0.35, 0, cx, cy, pipR * 0.85);
    highlight.addColorStop(0, "rgba(255,255,255,0.18)");
    highlight.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, pipR, 0, Math.PI * 2);
    ctx.fillStyle = highlight;
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ---------------------------------------------------------------------------
// Main Die3D component
// ---------------------------------------------------------------------------
export default function Die3D({
  value = 1,
  size = 72,
  held = false,
  used = false,
  rolling = false,
  onClick,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const cubeRef = useRef(null);
  const rollRef = useRef(false);
  const targetRotRef = useRef({ x: 0.4, y: -0.5, z: 0.08 });
  const currentRotRef = useRef({ x: 0.4, y: -0.5, z: 0.08 });
  const frameRef = useRef(null);
  const materialsRef = useRef([]);

  // Build materials for the current value
  function buildMaterials(val) {
    // Dispose old
    materialsRef.current.forEach(m => { m.map?.dispose(); m.dispose(); });
    const faceValues = getFaceValues(val);
    // Our geometry has 6 faces in order: +Z, -Z, +Y, -Y, +X, -X
    // but getFaceValues returns [+X, -X, +Y, -Y, +Z, -Z]
    // Reorder to match buildFace order: front(+Z), back(-Z), top(+Y), bottom(-Y), right(+X), left(-X)
    const ordered = [faceValues[4], faceValues[5], faceValues[2], faceValues[3], faceValues[0], faceValues[1]];
    const mats = ordered.map(fv =>
      new THREE.MeshStandardMaterial({
        map: makeFaceTexture(fv),
        roughness: 0.22,
        metalness: 0.0,
        envMapIntensity: 1.0,
      })
    );
    materialsRef.current = mats;
    return mats;
  }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Camera — orthographic-ish perspective to minimize distortion
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 3.6);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights — simulate a soft overhead studio light
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xfff8f0, 1.4);
    key.position.set(2.5, 4, 5);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xe8f0ff, 0.5);
    fill.position.set(-3, 1, 2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.3);
    rim.position.set(0, -3, -4);
    scene.add(rim);

    // Geometry: 16mm die scaled to ~1.5 units
    // Corner radius: ~2mm on a 16mm die = 1.5 * (2/16) ≈ 0.19
    const DIE_SIZE = 1.5;
    const CORNER_R = DIE_SIZE * (2.0 / 16);
    const FACE_SEGS = 6; // grid segments per face
    const geo = createRoundedBoxGeometry(DIE_SIZE, DIE_SIZE, DIE_SIZE, CORNER_R, FACE_SEGS);

    // Add draw groups — one per face, 6 faces
    // Each face has FACE_SEGS² quads = FACE_SEGS² * 2 triangles = FACE_SEGS² * 6 indices
    const indicesPerFace = FACE_SEGS * FACE_SEGS * 6;
    geo.clearGroups();
    for (let f = 0; f < 6; f++) {
      geo.addGroup(f * indicesPerFace, indicesPerFace, f);
    }

    const mats = buildMaterials(value);
    const cube = new THREE.Mesh(geo, mats);
    cube.rotation.x = currentRotRef.current.x;
    cube.rotation.y = currentRotRef.current.y;
    cube.rotation.z = currentRotRef.current.z;
    scene.add(cube);
    cubeRef.current = cube;

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (cubeRef.current) {
        if (rollRef.current) {
          cubeRef.current.rotation.x += 0.09;
          cubeRef.current.rotation.y += 0.14;
          cubeRef.current.rotation.z += 0.05;
        } else {
          const cur = currentRotRef.current;
          const tgt = targetRotRef.current;
          cur.x += (tgt.x - cur.x) * 0.1;
          cur.y += (tgt.y - cur.y) * 0.1;
          cur.z += (tgt.z - cur.z) * 0.1;
          cubeRef.current.rotation.x = cur.x;
          cubeRef.current.rotation.y = cur.y;
          cubeRef.current.rotation.z = cur.z;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      materialsRef.current.forEach(m => { m.map?.dispose(); m.dispose(); });
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [size]);

  // Rebuild materials when value changes
  useEffect(() => {
    if (!cubeRef.current) return;
    const mats = buildMaterials(value);
    cubeRef.current.material = mats;
    targetRotRef.current = {
      x: 0.4 + (Math.random() - 0.5) * 0.3,
      y: -0.5 + (Math.random() - 0.5) * 0.3,
      z: (Math.random() - 0.5) * 0.12,
    };
  }, [value]);

  // Rolling control
  useEffect(() => {
    rollRef.current = rolling;
    if (!rolling) {
      targetRotRef.current = {
        x: 0.4 + (Math.random() - 0.5) * 0.25,
        y: -0.5 + (Math.random() - 0.5) * 0.25,
        z: (Math.random() - 0.5) * 0.1,
      };
    }
  }, [rolling]);

  return (
    <div
      ref={mountRef}
      onClick={!used && !rolling ? onClick : undefined}
      style={{
        width: size,
        height: size,
        cursor: used || rolling ? "default" : "pointer",
        opacity: used ? 0.2 : 1,
        filter: used ? "grayscale(1)" : "",
        borderRadius: Math.round(size * 0.18),
        overflow: "hidden",
        flexShrink: 0,
        display: "inline-block",
        boxShadow: held
          ? "0 0 0 3px #fcd34d, 0 0 18px 5px rgba(252,211,77,0.7)"
          : "0 4px 20px rgba(0,0,0,0.5)",
      }}
    />
  );
}