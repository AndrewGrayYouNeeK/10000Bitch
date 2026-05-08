import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

const SPRITE_URL = "https://v3b.fal.media/files/b/0a996e7d/Dgc9VAOMxeIRsZGOSbKJh_KZutNRiP.png";

// The sprite sheet is 3 columns × 2 rows: faces 1-3 top, 4-6 bottom.
// Three.js BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
// Standard die opposite pairs: 1-6, 2-5, 3-4
// We show `value` on the front (+Z), arrange opposites correctly.
// Face material indices: 0=right(+X), 1=left(-X), 2=top(+Y), 3=bottom(-Y), 4=front(+Z), 5=back(-Z)

// For a standard die facing front:
//   front=value, back=7-value, top and sides vary
// We just need front face = value. Other faces: assign remaining values.
function getFaceAssignment(frontValue) {
  const back = 7 - frontValue;
  // remaining values for top/bottom/left/right
  const remaining = [1,2,3,4,5,6].filter(v => v !== frontValue && v !== back);
  // [right(+X), left(-X), top(+Y), bottom(-Y), front(+Z), back(-Z)]
  return [remaining[0], remaining[1], remaining[2], remaining[3], frontValue, back];
}

function createFaceTexture(faceValue, textureImage) {
  const canvas = document.createElement("canvas");
  const S = 512;
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");

  // The sprite: 3 cols × 2 rows
  const col = (faceValue - 1) % 3;
  const row = Math.floor((faceValue - 1) / 3);
  const fw = textureImage.naturalWidth / 3;
  const fh = textureImage.naturalHeight / 2;

  // Draw the face crop scaled to fill the canvas
  ctx.drawImage(
    textureImage,
    col * fw, row * fh, fw, fh,
    0, 0, S, S
  );

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function Die3D({ value = 1, size = 72, held = false, used = false, rolling = false, onClick }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cubeRef = useRef(null);
  const animRef = useRef(null);
  const rollAnimRef = useRef(null);
  const targetRotRef = useRef({ x: 0, y: 0, z: 0 });
  const currentRotRef = useRef({ x: 0, y: 0, z: 0 });

  // Face rotations so each face value points toward camera (+Z)
  // For a box, +Z face is index 4 (front). We rotate the cube so `value` face is front.
  // BoxGeometry: face 4 = +Z (front), face 5 = -Z (back),
  //              face 2 = +Y (top), face 3 = -Y (bottom),
  //              face 0 = +X (right), face 1 = -X (left)
  // We want `value` to face +Z (toward camera).
  // getFaceAssignment puts `value` at index 4 (front), so no rotation needed for showing value.
  // But for visual variety we tilt slightly.
  const baseRotation = useMemo(() => {
    return { x: 0.3, y: -0.4, z: 0.08 };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = size;
    const H = size;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(2, 3, 5);
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    // Load sprite image once then build materials
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const faceValues = getFaceAssignment(value);
      const materials = faceValues.map(fv => {
        const tex = createFaceTexture(fv, img);
        return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.18, metalness: 0.0 });
      });

      const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const cube = new THREE.Mesh(geo, materials);
      cube.rotation.x = baseRotation.x;
      cube.rotation.y = baseRotation.y;
      cube.rotation.z = baseRotation.z;
      currentRotRef.current = { ...baseRotation };
      targetRotRef.current = { ...baseRotation };
      scene.add(cube);
      cubeRef.current = cube;

      renderer.render(scene, camera);
    };
    img.src = SPRITE_URL;

    // Animate loop
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (cubeRef.current) {
        if (rollAnimRef.current) {
          // During roll: spin freely
          cubeRef.current.rotation.x += 0.09;
          cubeRef.current.rotation.y += 0.13;
          cubeRef.current.rotation.z += 0.05;
        } else {
          // Ease to target rotation
          const cur = currentRotRef.current;
          const tgt = targetRotRef.current;
          cur.x += (tgt.x - cur.x) * 0.12;
          cur.y += (tgt.y - cur.y) * 0.12;
          cur.z += (tgt.z - cur.z) * 0.12;
          cubeRef.current.rotation.x = cur.x;
          cubeRef.current.rotation.y = cur.y;
          cubeRef.current.rotation.z = cur.z;
        }
      }
      renderer.render(scene, camera);
    };
    animate();
    animRef.current = frameId;

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [size]);

  // When value changes, rebuild materials
  useEffect(() => {
    if (!cubeRef.current) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const faceValues = getFaceAssignment(value);
      const newMaterials = faceValues.map(fv => {
        const tex = createFaceTexture(fv, img);
        return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.18, metalness: 0.0 });
      });
      // Dispose old
      if (Array.isArray(cubeRef.current.material)) {
        cubeRef.current.material.forEach(m => { m.map?.dispose(); m.dispose(); });
      }
      cubeRef.current.material = newMaterials;
      // Settle to a slight tilt after roll
      targetRotRef.current = {
        x: baseRotation.x + (Math.random() - 0.5) * 0.25,
        y: baseRotation.y + (Math.random() - 0.5) * 0.25,
        z: baseRotation.z + (Math.random() - 0.5) * 0.1,
      };
    };
    img.src = SPRITE_URL;
  }, [value]);

  // Rolling animation control
  useEffect(() => {
    if (rolling) {
      rollAnimRef.current = true;
    } else {
      rollAnimRef.current = false;
      targetRotRef.current = {
        x: baseRotation.x + (Math.random() - 0.5) * 0.2,
        y: baseRotation.y + (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.12,
      };
    }
  }, [rolling]);

  const opacity = used ? 0.2 : 1;
  const filter = used ? "grayscale(1)" : "";
  const outline = held ? "0 0 0 3px #fcd34d, 0 0 16px 4px rgba(252,211,77,0.7)" : "";

  return (
    <div
      ref={mountRef}
      onClick={!used && !rolling ? onClick : undefined}
      style={{
        width: size,
        height: size,
        cursor: used || rolling ? "default" : "pointer",
        opacity,
        filter,
        boxShadow: outline,
        borderRadius: Math.round(size * 0.18),
        overflow: "hidden",
        flexShrink: 0,
        display: "inline-block",
      }}
    />
  );
}