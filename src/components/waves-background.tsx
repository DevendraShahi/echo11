"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type WavesBackgroundProps = {
  className?: string;
};

const SEPARATION = 34;
const AMOUNT_X = 80;
const AMOUNT_Y = 58;

export function WavesBackground({ className = "" }: WavesBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, 1, 1, 4000);
    camera.position.set(0, 220, 460);
    camera.lookAt(0, 0, 0);

    const totalPoints = AMOUNT_X * AMOUNT_Y;
    const positions = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);

    const startX = (AMOUNT_X * SEPARATION) / 2;
    const startY = (AMOUNT_Y * SEPARATION) / 2;

    let pointerX = 0;
    let pointerY = 0;

    for (let ix = 0; ix < AMOUNT_X; ix += 1) {
      for (let iy = 0; iy < AMOUNT_Y; iy += 1) {
        const idx = ix * AMOUNT_Y + iy;
        const p = idx * 3;

        positions[p] = ix * SEPARATION - startX;
        positions[p + 1] = 0;
        positions[p + 2] = iy * SEPARATION - startY;

        const tone = 0.52 + (iy / AMOUNT_Y) * 0.22;
        colors[p] = 0.24;
        colors[p + 1] = tone;
        colors[p + 2] = 0.98;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.92,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const resize = () => {
      const { clientWidth, clientHeight } = mount;

      if (!clientWidth || !clientHeight) {
        return;
      }

      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      pointerX = ((x / rect.width) * 2 - 1) * 55;
      pointerY = ((y / rect.height) * 2 - 1) * 24;
    };

    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", resize);

    let rafId = 0;
    let count = 0;

    const render = () => {
      const positionAttr = geometry.getAttribute("position") as THREE.BufferAttribute;

      let i = 0;
      for (let ix = 0; ix < AMOUNT_X; ix += 1) {
        for (let iy = 0; iy < AMOUNT_Y; iy += 1) {
          const waveA = Math.sin((ix + count) * 0.28);
          const waveB = Math.sin((iy + count) * 0.41);
          const waveC = Math.cos((ix + iy + count) * 0.12);

          positionAttr.array[i + 1] = waveA * 14 + waveB * 15 + waveC * 6;
          i += 3;
        }
      }

      positionAttr.needsUpdate = true;

      particles.rotation.y += (pointerX * 0.0012 - particles.rotation.y) * 0.035;
      particles.rotation.x += (pointerY * 0.00065 - particles.rotation.x) * 0.025;

      renderer.render(scene, camera);
      count += 0.09;

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    resize();
    render();

    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      className={`waves-background ${className}`.trim()}
      ref={mountRef}
      aria-hidden="true"
    />
  );
}
