import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../../hooks/useAsync';
import { riskColor } from '../../utils/risk';

export interface GlobeMarker {
  region_id: string;
  name: string;
  lat: number;
  lon: number;
  bust_probability: number;
  confidence: number;
}

const R = 1;

function toVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Latitude / longitude graticule as line segments just above the surface. */
function buildGraticule(): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let lon = -180; lon < 180; lon += 30) {
    for (let lat = -90; lat < 90; lat += 1) {
      const a = toVec3(lat, lon, R * 1.004);
      const b = toVec3(lat + 1, lon, R * 1.004);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = -180; lon < 180; lon += 1) {
      const a = toVec3(lat, lon, R * 1.004);
      const b = toVec3(lat, lon + 1, R * 1.004);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/** Great-circle arc used as the "selected region" highlight. */
function buildArc(from: THREE.Vector3, to: THREE.Vector3, lift = 1.16): THREE.BufferGeometry {
  const pts: number[] = [];
  const v = new THREE.Vector3();
  for (let i = 0; i <= 48; i += 1) {
    const t = i / 48;
    v.copy(from).lerp(to, t).normalize().multiplyScalar(R + Math.sin(Math.PI * t) * (lift - R));
    pts.push(v.x, v.y, v.z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

export function AtmosphereGlobe({
  markers,
  selectedId,
  onSelect,
  className,
}: {
  markers: GlobeMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [webgl, setWebgl] = useState(true);
  const [hovered, setHovered] = useState<GlobeMarker | null>(null);

  const ordered = useMemo(
    () => [...markers].sort((a, b) => a.bust_probability - b.bust_probability),
    [markers],
  );

  const rebuildRef = useRef<() => void>(() => {});
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const orderedRef = useRef(ordered);
  orderedRef.current = ordered;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;

  /* ------------------------------------------------------------------ scene */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      setWebgl(false);
      return;
    }
    if (!renderer.getContext()) {
      renderer.dispose();
      setWebgl(false);
      return;
    }

    const width = host.clientWidth || 320;
    const height = host.clientHeight || 240;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.28, 4.1);

    const group = new THREE.Group();
    group.rotation.z = THREE.MathUtils.degToRad(-14);
    scene.add(group);

    const bodyGeo = new THREE.SphereGeometry(R, 64, 48);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0xf7fbfe });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    const rimGeo = new THREE.SphereGeometry(R * 1.014, 64, 48);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0xb7d9f3,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.6,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    group.add(rim);

    const haloGeo = new THREE.SphereGeometry(R * 1.18, 48, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x4fa8dd,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.1,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    const gratGeo = buildGraticule();
    const gratMat = new THREE.LineBasicMaterial({ color: 0x9dc7ee, transparent: true, opacity: 0.8 });
    const graticule = new THREE.LineSegments(gratGeo, gratMat);
    group.add(graticule);

    /* ------------------------------------------------------------- markers */
    const markerGeo = new THREE.SphereGeometry(1, 14, 12);
    let meshes: THREE.Mesh[] = [];
    let markerData: GlobeMarker[] = [];
    let selected: string | null = null;
    let arc: THREE.Line | null = null;

    const clearMarkers = () => {
      meshes.forEach((m) => {
        group.remove(m);
        (m.material as THREE.Material).dispose();
      });
      meshes = [];
      if (arc) {
        group.remove(arc);
        arc.geometry.dispose();
        (arc.material as THREE.Material).dispose();
        arc = null;
      }
    };

    rebuildRef.current = () => {
      clearMarkers();
      markerData = orderedRef.current;
      selected = selectedRef.current ?? null;

      markerData.forEach((mk, i) => {
        const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(riskColor(mk.bust_probability)) });
        const mesh = new THREE.Mesh(markerGeo, mat);
        mesh.position.copy(toVec3(mk.lat, mk.lon, R * 1.014));
        const base = 0.02 + mk.bust_probability * 0.042;
        mesh.scale.setScalar(base);
        mesh.userData = { id: mk.region_id, base, phase: (i % 14) * 0.45, index: i };
        group.add(mesh);
        meshes.push(mesh);
      });

      const idx = markerData.findIndex((m) => m.region_id === selected);
      if (idx >= 0 && markerData.length) {
        const from = toVec3(markerData[idx].lat, markerData[idx].lon, R * 1.014);
        const j = markerData.length > 1 ? (idx + Math.floor(markerData.length / 2)) % markerData.length : 0;
        const to =
          j === idx
            ? toVec3(markerData[idx].lat + 40 > 85 ? 20 : markerData[idx].lat + 40, markerData[idx].lon, R * 1.014)
            : toVec3(markerData[j].lat, markerData[j].lon, R * 1.014);
        const mat = new THREE.LineBasicMaterial({ color: 0x1c6fb2, transparent: true, opacity: 0.95 });
        arc = new THREE.Line(buildArc(from, to), mat);
        group.add(arc);
      }
    };
    rebuildRef.current();

    /* --------------------------------------------------------- interaction */
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let tiltX = 0;
    let tiltTargetX = 0;
    let tiltY = 0;
    let tiltTargetY = 0;

    const setPointer = (e: PointerEvent | MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      );
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      tiltTargetX = ny * 0.15;
      tiltTargetY = nx * 0.2;

      setPointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0]?.object as THREE.Mesh | undefined;
      const id = hit ? String(hit.userData.id) : null;
      renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
      const next = id ? markerData.find((m) => m.region_id === id) ?? null : null;
      setHovered((prev) => (prev?.region_id === next?.region_id ? prev : next));
    };

    const onPointerLeave = () => {
      tiltTargetX = 0;
      tiltTargetY = 0;
      setHovered(null);
      renderer.domElement.style.cursor = 'grab';
    };

    const onClick = (e: MouseEvent) => {
      setPointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0]?.object as THREE.Mesh | undefined;
      if (hit?.userData.id) onSelectRef.current?.(String(hit.userData.id));
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('click', onClick);

    const ro = new ResizeObserver(() => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    ro.observe(host);

    /* ---------------------------------------------------------------- loop */
    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();

      if (!reduced) {
        group.rotation.y += 0.0022;
        haloMat.opacity = 0.09 + Math.sin(t * 1.25) * 0.03;
        for (const m of meshes) {
          const base = m.userData.base as number;
          const phase = m.userData.phase as number;
          const isSel = m.userData.id === selected;
          if (!isSel) m.scale.setScalar(base * (1 + Math.sin(t * 2.1 + phase) * 0.22));
        }
      }

      tiltX += (tiltTargetX - tiltX) * 0.06;
      tiltY += (tiltTargetY - tiltY) * 0.06;
      group.rotation.x = tiltX;
      group.rotation.y += tiltY * 0.0025;
      group.position.y = Math.sin(t * 0.7) * 0.028;

      for (const m of meshes) {
        const isSel = m.userData.id === selected;
        const mat = m.material as THREE.MeshBasicMaterial;
        const base = m.userData.base as number;
        const key = isSel ? 'sel' : 'std';
        if (mat.userData.key !== key) {
          mat.userData.key = key;
          mat.color.set(isSel ? 0x0b1f38 : String(m.userData.color ?? mat.color.getHexString()));
          if (isSel) m.scale.setScalar(base * 2.1);
          else if (!reduced) m.scale.setScalar(base);
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    // remember the original colour so selection can be reverted
    meshes.forEach((m) => {
      (m.userData as Record<string, unknown>).color = (m.material as THREE.MeshBasicMaterial).color.getHexString();
    });
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('click', onClick);
      clearMarkers();
      markerGeo.dispose();
      bodyGeo.dispose();
      rimGeo.dispose();
      haloGeo.dispose();
      gratGeo.dispose();
      bodyMat.dispose();
      rimMat.dispose();
      haloMat.dispose();
      gratMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  /* live refs so the scene can rebuild without tearing down */
  useEffect(() => {
    rebuildRef.current();
  }, [ordered, selectedId]);

  if (!webgl) {
    return (
      <div className={`relative flex items-center justify-center ${className ?? ''}`} aria-hidden="true">
        <div className="h-40 w-40 rounded-full border-2 border-ice-200" />
        <div className="absolute h-52 w-52 animate-pulseRing rounded-full border border-blue-200" />
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <div ref={hostRef} className="absolute inset-0" style={{ cursor: 'grab' }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0)_55%,rgba(243,249,254,0.85)_100%)]" />
      {hovered && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg border border-ice-200 bg-white/95 px-3 py-2 shadow-lift backdrop-blur">
          <div className="text-[12px] font-bold text-navy-900">{hovered.name}</div>
          <div className="data-value mt-0.5 text-[11px] text-slate-500">
            confidence {hovered.confidence}% · bust {Math.round(hovered.bust_probability * 100)}%
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-slate-400">
        hover to tilt · click a marker to open the region
      </div>
    </div>
  );
}
