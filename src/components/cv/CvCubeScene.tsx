"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { galleryImagePath, type GalleryEntry } from "@/lib/gallery";

const CUBE_SIZE = "min(63vw, 420px)";
const HALF = "calc(min(63vw, 420px) / 2)";
const SWIPE_MIN = 14;
const STEP_LOCK_MS = 550;
const SNAP_MS = 320;
const CUBE_ASSET_VERSION = "4";

const FACES = ["front", "back", "right", "left", "top", "bottom"] as const;
type CubeFace = (typeof FACES)[number];
type SwipeDirection = "left" | "right" | "up" | "down";
type Quat = [number, number, number, number];

const IDENTITY_QUAT: Quat = [1, 0, 0, 0];
const VIEW_DIR: [number, number, number] = [0, 0, 1];
const SCREEN_UP: [number, number, number] = [0, -1, 0];

const FACE_NORMALS: Record<CubeFace, [number, number, number]> = {
  front: [0, 0, 1],
  back: [0, 0, -1],
  right: [1, 0, 0],
  left: [-1, 0, 0],
  top: [0, 1, 0],
  bottom: [0, -1, 0],
};

/** Top-of-image direction on each face in cube-local space. */
const FACE_IMAGE_UP: Record<CubeFace, [number, number, number]> = {
  front: [0, -1, 0],
  back: [0, -1, 0],
  right: [0, -1, 0],
  left: [0, -1, 0],
  top: [0, 0, 1],
  bottom: [0, 0, -1],
};

type CubeState = {
  orientation: Quat;
  faceSlots: Record<CubeFace, number>;
  nextIndex: number;
};

type CvCubeSceneProps = {
  items: GalleryEntry[];
};

function wheelDelta(event: WheelEvent) {
  const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 800 : 1;
  return {
    x: event.deltaX * scale,
    y: event.deltaY * scale,
  };
}

function directionFromWheel(x: number, y: number): SwipeDirection | null {
  const absX = Math.abs(x);
  const absY = Math.abs(y);

  if (absX < SWIPE_MIN && absY < SWIPE_MIN) {
    return null;
  }

  if (absX >= absY) {
    return x > 0 ? "right" : "left";
  }

  return y < 0 ? "up" : "down";
}

function quatFromAxisAngle(ax: number, ay: number, az: number, degrees: number): Quat {
  const half = (degrees * Math.PI) / 360;
  const s = Math.sin(half);
  const length = Math.hypot(ax, ay, az) || 1;

  return [
    Math.cos(half),
    (ax / length) * s,
    (ay / length) * s,
    (az / length) * s,
  ];
}

function quatMultiply(a: Quat, b: Quat): Quat {
  const [w1, x1, y1, z1] = a;
  const [w2, x2, y2, z2] = b;

  return [
    w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
    w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
    w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
    w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2,
  ];
}

function normalizeQuat(q: Quat): Quat {
  const length = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / length, q[1] / length, q[2] / length, q[3] / length];
}

function quatRotateVector(q: Quat, v: [number, number, number]): [number, number, number] {
  const [w, x, y, z] = q;
  const [vx, vy, vz] = v;
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);

  return [
    vx + w * tx + (y * tz - z * ty),
    vy + w * ty + (z * tx - x * tz),
    vz + w * tz + (x * ty - y * tx),
  ];
}

function dot(a: [number, number, number], b: [number, number, number]) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(
  a: [number, number, number],
  b: [number, number, number],
): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize(v: [number, number, number]): [number, number, number] {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

function rotateAroundAxis(
  v: [number, number, number],
  axis: [number, number, number],
  degrees: number,
): [number, number, number] {
  const rad = (degrees * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const k = normalize(axis);
  const kv = dot(k, v);
  const crossKV = cross(k, v);

  return [
    v[0] * c + crossKV[0] * s + k[0] * kv * (1 - c),
    v[1] * c + crossKV[1] * s + k[1] * kv * (1 - c),
    v[2] * c + crossKV[2] * s + k[2] * kv * (1 - c),
  ];
}

const UPRIGHT_CANDIDATES = [0, 90, 180, 270] as const;

/** Snap image to the nearest upright quarter-turn for this orientation. */
function getFaceUprightDegrees(q: Quat, face: CubeFace): number {
  const normal = normalize(quatRotateVector(q, FACE_NORMALS[face]));

  if (dot(normal, VIEW_DIR) < 0.05) {
    return 0;
  }

  const imageUp = quatRotateVector(q, FACE_IMAGE_UP[face]);
  let bestScore = -Infinity;
  let bestDeg = 0;

  for (const deg of UPRIGHT_CANDIDATES) {
    const correctedUp = rotateAroundAxis(imageUp, normal, deg);
    const score = dot(correctedUp, SCREEN_UP);

    if (score > bestScore) {
      bestScore = score;
      bestDeg = deg;
    }
  }

  return bestDeg;
}

function stepOrientation(q: Quat, direction: SwipeDirection): Quat {
  let delta: Quat;

  switch (direction) {
    case "left":
      delta = quatFromAxisAngle(0, 1, 0, 90);
      break;
    case "right":
      delta = quatFromAxisAngle(0, 1, 0, -90);
      break;
    case "up":
      delta = quatFromAxisAngle(1, 0, 0, -90);
      break;
    case "down":
      delta = quatFromAxisAngle(1, 0, 0, 90);
      break;
  }

  return normalizeQuat(quatMultiply(delta, q));
}

function getMostHiddenFace(q: Quat): CubeFace {
  let hiddenFace: CubeFace = "back";
  let smallestDot = Infinity;

  for (const face of FACES) {
    const worldNormal = quatRotateVector(q, FACE_NORMALS[face]);
    const facing = dot(worldNormal, VIEW_DIR);

    if (facing < smallestDot) {
      smallestDot = facing;
      hiddenFace = face;
    }
  }

  return hiddenFace;
}

function createInitialState(imageCount: number): CubeState {
  const faceSlots = {} as Record<CubeFace, number>;

  FACES.forEach((face, index) => {
    faceSlots[face] = imageCount > 0 ? index % imageCount : 0;
  });

  return {
    orientation: IDENTITY_QUAT,
    faceSlots,
    nextIndex: imageCount > 0 ? Math.min(FACES.length, imageCount) : 0,
  };
}

type CubeAction =
  | { type: "rotate"; direction: SwipeDirection; imageCount: number }
  | { type: "reset"; imageCount: number };

function cubeReducer(state: CubeState, action: CubeAction): CubeState {
  if (action.type === "reset") {
    return createInitialState(action.imageCount);
  }

  const orientation = stepOrientation(state.orientation, action.direction);

  if (action.imageCount === 0) {
    return { ...state, orientation };
  }

  const hiddenFace = getMostHiddenFace(orientation);
  const faceSlots = { ...state.faceSlots };
  faceSlots[hiddenFace] = state.nextIndex % action.imageCount;

  return {
    orientation,
    faceSlots,
    nextIndex: state.nextIndex + 1,
  };
}

function quatToMatrix3d(q: Quat): string {
  const [w, x, y, z] = q;
  const xx = x * x;
  const xy = x * y;
  const xz = x * z;
  const xw = x * w;
  const yy = y * y;
  const yz = y * z;
  const yw = y * w;
  const zz = z * z;
  const zw = z * w;

  const m11 = 1 - 2 * (yy + zz);
  const m12 = 2 * (xy - zw);
  const m13 = 2 * (xz + yw);
  const m21 = 2 * (xy + zw);
  const m22 = 1 - 2 * (xx + zz);
  const m23 = 2 * (yz - xw);
  const m31 = 2 * (xz - yw);
  const m32 = 2 * (yz + xw);
  const m33 = 1 - 2 * (xx + yy);

  return `matrix3d(${m11},${m21},${m31},0,${m12},${m22},${m32},0,${m13},${m23},${m33},0,0,0,0,1)`;
}

function faceTransform(face: CubeFace): React.CSSProperties {
  switch (face) {
    case "front":
      return { transform: `translateZ(${HALF})` };
    case "back":
      return { transform: `rotateY(180deg) translateZ(${HALF})` };
    case "right":
      return { transform: `rotateY(90deg) translateZ(${HALF})` };
    case "left":
      return { transform: `rotateY(-90deg) translateZ(${HALF})` };
    case "top":
      return { transform: `rotateX(90deg) translateZ(${HALF})` };
    case "bottom":
      return { transform: `rotateX(-90deg) translateZ(${HALF})` };
  }
}

export function CvCubeScene({ items }: CvCubeSceneProps) {
  const imageCount = items.length;
  const itemSignature = items.map((item) => item.image).join(",");
  const [state, dispatch] = useReducer(cubeReducer, imageCount, createInitialState);
  const [uprightOrientation, setUprightOrientation] = useState<Quat>(IDENTITY_QUAT);
  const lockedUntil = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const preloaded = useRef(new Set<string>());
  const snapTimer = useRef<number | null>(null);

  useEffect(() => {
    dispatch({ type: "reset", imageCount });
    setUprightOrientation(IDENTITY_QUAT);
  }, [imageCount, itemSignature]);

  useEffect(() => {
    if (snapTimer.current !== null) {
      window.clearTimeout(snapTimer.current);
    }

    snapTimer.current = window.setTimeout(() => {
      setUprightOrientation(state.orientation);
      snapTimer.current = null;
    }, SNAP_MS);

    return () => {
      if (snapTimer.current !== null) {
        window.clearTimeout(snapTimer.current);
      }
    };
  }, [state.orientation]);

  useEffect(() => {
    if (imageCount === 0) {
      return;
    }

    const upcoming = new Set<number>();
    for (const face of FACES) {
      upcoming.add(state.faceSlots[face]);
      upcoming.add((state.faceSlots[face] + 1) % imageCount);
      upcoming.add((state.faceSlots[face] + 2) % imageCount);
    }

    for (const index of upcoming) {
      const item = items[index];
      if (!item) {
        continue;
      }

      const url = `${galleryImagePath("/cv-cube/web", item.image)}?v=${CUBE_ASSET_VERSION}`;
      if (preloaded.current.has(url)) {
        continue;
      }

      preloaded.current.add(url);
      const img = new window.Image();
      img.decoding = "async";
      img.src = url;
    }
  }, [imageCount, items, state.faceSlots]);

  const rotate = useCallback(
    (direction: SwipeDirection) => {
      dispatch({ type: "rotate", direction, imageCount });
    },
    [imageCount],
  );

  const tryStep = useCallback(
    (direction: SwipeDirection) => {
      const now = Date.now();
      if (now < lockedUntil.current) {
        return;
      }

      lockedUntil.current = now + STEP_LOCK_MS;
      rotate(direction);
    },
    [rotate],
  );

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      const now = Date.now();
      if (now < lockedUntil.current) {
        return;
      }

      const { x, y } = wheelDelta(event);
      const direction = directionFromWheel(x, y);

      if (direction) {
        tryStep(direction);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [tryStep]);

  const onTouchStart = (event: React.TouchEvent) => {
    const point = event.touches[0];
    if (!point) {
      return;
    }

    touchStart.current = { x: point.clientX, y: point.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    const end = event.changedTouches[0];
    touchStart.current = null;

    if (!start || !end) {
      return;
    }

    const deltaX = start.x - end.clientX;
    const deltaY = start.y - end.clientY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < 40) {
      return;
    }

    if (absX >= absY) {
      tryStep(deltaX > 0 ? "right" : "left");
      return;
    }

    tryStep(deltaY > 0 ? "up" : "down");
  };

  const hasImages = imageCount > 0;

  return (
    <div
      className="flex h-full w-full items-center justify-center touch-none select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        style={{ perspective: "900px", perspectiveOrigin: "50% 50%" }}
        aria-label="Rotate the cube with trackpad swipes"
        role="img"
      >
        <div
          className="relative"
          style={{
            width: CUBE_SIZE,
            height: CUBE_SIZE,
            transform: quatToMatrix3d(state.orientation),
            transformStyle: "preserve-3d",
            transition: `transform ${SNAP_MS}ms ease-out`,
          }}
        >
          {FACES.map((face) => {
            const item = hasImages ? items[state.faceSlots[face]] : null;
            const uprightDeg = hasImages
              ? getFaceUprightDegrees(uprightOrientation, face)
              : 0;

            return (
              <div
                key={face}
                className={`absolute overflow-hidden ${hasImages ? "bg-portfolio-bg" : "border border-portfolio-fg/70 bg-portfolio-fg/[0.03]"}`}
                style={{
                  width: CUBE_SIZE,
                  height: CUBE_SIZE,
                  backfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                  ...faceTransform(face),
                }}
              >
                {item ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${galleryImagePath("/cv-cube/web", item.image)}?v=${CUBE_ASSET_VERSION}`}
                    alt={item.title}
                    className="absolute inset-0 size-full object-cover"
                    style={{
                      transform: `rotate(${uprightDeg}deg)`,
                      transformOrigin: "center center",
                    }}
                    decoding="async"
                    draggable={false}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
