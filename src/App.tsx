import React, { useMemo, useRef, useState } from "react";

type MilestoneType =
  | "birth"
  | "marriage"
  | "anniversary"
  | "family"
  | "home"
  | "career"
  | "travel"
  | "graduation"
  | "memorial"
  | "other";

type DesignChoice = "auto" | string;

type Milestone = {
  id: string;
  title: string;
  date: string;
  type: MilestoneType;
  importance: number;
  designChoice: DesignChoice;
};

type DraftMilestone = {
  title: string;
  date: string;
  type: MilestoneType;
  importance: number;
  designChoice: DesignChoice;
};

type Point = { x: number; y: number };

type PathLayer = {
  d: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  dasharray?: string;
};

type DesignPreset = {
  id: string;
  label: string;
  render: (
    radius: number,
    palette: string[],
    rotationDeg: number
  ) => PathLayer[];
};

type ComposedMilestone = {
  milestone: Milestone;
  design: DesignPreset;
  x: number;
  y: number;
  radius: number;
  rotation: number;
  palette: string[];
  layers: PathLayer[];
};

const CANVAS_W = 1400;
const CANVAS_H = 1400;
const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const TYPE_OPTIONS: { value: MilestoneType; label: string }[] = [
  { value: "birth", label: "Birth" },
  { value: "marriage", label: "Marriage" },
  { value: "anniversary", label: "Anniversary" },
  { value: "family", label: "Family" },
  { value: "home", label: "Home" },
  { value: "career", label: "Career" },
  { value: "travel", label: "Travel" },
  { value: "graduation", label: "Graduation" },
  { value: "memorial", label: "Memorial" },
  { value: "other", label: "Other" },
];

const TYPE_PALETTES: Record<MilestoneType, string[]> = {
  birth: ["#8CCCD1", "#F2B84B", "#5E6F86", "#89B95C"],
  marriage: ["#A6D8DD", "#EFB15A", "#546176", "#9EBC5C"],
  anniversary: ["#9ED1D5", "#F0C64F", "#687287", "#7CB36B"],
  family: ["#91C8C7", "#EFC257", "#536B7F", "#86B66C"],
  home: ["#B0D9D4", "#E7B86A", "#667486", "#A4BA68"],
  career: ["#A5C8D2", "#F0AF59", "#5A667B", "#95AF70"],
  travel: ["#8DD1D6", "#F4C54C", "#4F6178", "#76B87D"],
  graduation: ["#A0CFD2", "#F2BE55", "#5C687E", "#9AB969"],
  memorial: ["#B8C8C5", "#D9C57E", "#6D7480", "#A4AE84"],
  other: ["#9FD1D0", "#F0BE55", "#5C6B80", "#8BB76C"],
};

const TYPE_SIZE_WEIGHT: Record<MilestoneType, number> = {
  birth: 1.03,
  marriage: 1.04,
  anniversary: 1.0,
  family: 1.0,
  home: 0.97,
  career: 0.96,
  travel: 0.95,
  graduation: 0.96,
  memorial: 1.0,
  other: 0.97,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function fmt(n: number) {
  return Number(n.toFixed(2));
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function rotatePoint(p: Point, deg: number): Point {
  const r = degToRad(deg);
  const c = Math.cos(r);
  const s = Math.sin(r);

  return {
    x: p.x * c - p.y * s,
    y: p.x * s + p.y * c,
  };
}

function sampleCurve(
  fn: (t: number) => Point,
  steps: number,
  start = 0,
  end = TAU
): Point[] {
  const points: Point[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = start + ((end - start) * i) / steps;
    points.push(fn(t));
  }

  return points;
}

function pointsToPath(points: Point[], close = true) {
  if (!points.length) return "";

  const [first, ...rest] = points;

  return (
    `M ${fmt(first.x)} ${fmt(first.y)} ` +
    rest.map((p) => `L ${fmt(p.x)} ${fmt(p.y)}`).join(" ") +
    (close ? " Z" : "")
  );
}

function circlePoints(radius: number, steps = 520): Point[] {
  return sampleCurve(
    (t) => ({
      x: radius * Math.cos(t),
      y: radius * Math.sin(t),
    }),
    steps
  );
}

function hypotrochoidPoints(
  R: number,
  r: number,
  d: number,
  turns: number,
  rotationDeg = 0,
  steps = 2400
): Point[] {
  return sampleCurve(
    (t) => {
      const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
      const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);

      return rotatePoint({ x, y }, rotationDeg);
    },
    steps,
    0,
    TAU * turns
  );
}

function epitrochoidPoints(
  R: number,
  r: number,
  d: number,
  turns: number,
  rotationDeg = 0,
  steps = 2400
): Point[] {
  return sampleCurve(
    (t) => {
      const x = (R + r) * Math.cos(t) - d * Math.cos(((R + r) / r) * t);
      const y = (R + r) * Math.sin(t) - d * Math.sin(((R + r) / r) * t);

      return rotatePoint({ x, y }, rotationDeg);
    },
    steps,
    0,
    TAU * turns
  );
}

function rosettePoints(
  radius: number,
  petalCount: number,
  amp: number,
  inner: number,
  rotationDeg = 0,
  steps = 2000,
  phase = 0
): Point[] {
  return sampleCurve(
    (t) => {
      const rr =
        radius *
        (inner + amp * (0.5 + 0.5 * Math.cos(petalCount * t + phase)));

      return rotatePoint(
        {
          x: rr * Math.cos(t),
          y: rr * Math.sin(t),
        },
        rotationDeg
      );
    },
    steps
  );
}

function lissajousPoints(
  radius: number,
  a: number,
  b: number,
  delta: number,
  rotationDeg = 0,
  steps = 2400
): Point[] {
  return sampleCurve(
    (t) => {
      const x = radius * Math.sin(a * t + delta);
      const y = radius * Math.sin(b * t);

      return rotatePoint({ x, y }, rotationDeg);
    },
    steps
  );
}

function superellipseOrbitPoints(
  radius: number,
  exponent: number,
  wobbleFreq: number,
  wobbleAmp: number,
  rotationDeg = 0,
  steps = 2000,
  phase = 0
): Point[] {
  return sampleCurve(
    (t) => {
      const rr = radius * (0.76 + wobbleAmp * Math.cos(wobbleFreq * t + phase));
      const c = Math.cos(t);
      const s = Math.sin(t);

      const x = rr * Math.sign(c) * Math.pow(Math.abs(c), 2 / exponent);
      const y = rr * Math.sign(s) * Math.pow(Math.abs(s), 2 / exponent);

      return rotatePoint({ x, y }, rotationDeg);
    },
    steps
  );
}

function irregularOrbitPoints(
  radius: number,
  freqA: number,
  freqB: number,
  ampA: number,
  ampB: number,
  rotationDeg = 0,
  steps = 2000
): Point[] {
  return sampleCurve(
    (t) => {
      const rr =
        radius *
        (0.72 +
          ampA * Math.cos(freqA * t) +
          ampB * Math.sin(freqB * t + 0.7));

      return rotatePoint(
        {
          x: rr * Math.cos(t),
          y: rr * Math.sin(t),
        },
        rotationDeg
      );
    },
    steps
  );
}

function spiralVortexPoints(
  radius: number,
  petals: number,
  rotationDeg = 0,
  steps = 2600
): Point[] {
  const turns = 7;

  return sampleCurve(
    (t) => {
      const p = t / (TAU * turns);

      const rr =
        radius *
        (0.13 +
          0.74 * p +
          0.13 * Math.cos(petals * t + p * 8.8) +
          0.045 * Math.sin(17 * t));

      return rotatePoint(
        {
          x: rr * Math.cos(t),
          y: rr * Math.sin(t),
        },
        rotationDeg
      );
    },
    steps,
    0,
    TAU * turns
  );
}

function radialThreadDiskPoints(
  radius: number,
  skip: number,
  count: number,
  rotationDeg = 0
): Point[] {
  const pts: Point[] = [];

  for (let i = 0; i <= count; i++) {
    const a = ((i * skip) % count) / count;
    const t = a * TAU;

    pts.push(
      rotatePoint(
        {
          x: radius * Math.cos(t),
          y: radius * Math.sin(t),
        },
        rotationDeg
      )
    );
  }

  return pts;
}

function fibonacciSpiralPoints(
  centerX: number,
  centerY: number,
  startRadius: number,
  growth: number,
  turns: number,
  rotation = 0,
  xScale = 1,
  yScale = 1,
  steps = 1100
): Point[] {
  const points: Point[] = [];
  const maxTheta = turns * TAU;

  for (let i = 0; i <= steps; i++) {
    const theta = (maxTheta * i) / steps;
    const r = startRadius * Math.pow(PHI, growth * theta);
    const a = theta + rotation;

    points.push({
      x: centerX + Math.cos(a) * r * xScale,
      y: centerY + Math.sin(a) * r * yScale,
    });
  }

  return points;
}

function orbitSweepPoints(
  centerX: number,
  centerY: number,
  radius: number,
  rotation = 0,
  xScale = 1,
  yScale = 1,
  steps = 900,
  start = -0.25 * TAU,
  end = 1.1 * TAU
): Point[] {
  const points: Point[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = start + ((end - start) * i) / steps;
    const wobble = 1 + 0.035 * Math.sin(3 * t + rotation);

    points.push({
      x: centerX + Math.cos(t + rotation) * radius * wobble * xScale,
      y: centerY + Math.sin(t + rotation) * radius * wobble * yScale,
    });
  }

  return points;
}

function layer(
  points: Point[],
  stroke: string,
  strokeWidth: number,
  opacity: number,
  close = true,
  dasharray?: string
): PathLayer {
  return {
    d: pointsToPath(points, close),
    stroke,
    strokeWidth,
    opacity,
    dasharray,
  };
}

const DESIGN_LIBRARY: DesignPreset[] = [
  {
    id: "greenGuillocheDonut",
    label: "Green Guilloche Donut",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.011, 0.55, 1.35);
      const R = radius * 0.77;
      const r = R / 11;

      return [
        layer(
          hypotrochoidPoints(R, r, radius * 0.28, 11, rotation, 2600),
          palette[1],
          sw,
          0.54
        ),
        layer(
          hypotrochoidPoints(R * 0.94, r, radius * 0.24, 11, rotation + 7, 2400),
          palette[0],
          sw * 0.88,
          0.34
        ),
        layer(circlePoints(radius * 0.32), palette[3], sw * 1.4, 0.48),
      ];
    },
  },
  {
    id: "fineMeshHalo",
    label: "Fine Mesh Halo",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.0085, 0.48, 1.15);

      return [
        layer(
          radialThreadDiskPoints(radius * 0.92, 43, 151, rotation),
          palette[0],
          sw,
          0.42
        ),
        layer(
          radialThreadDiskPoints(radius * 0.82, 37, 137, rotation + 4),
          palette[2],
          sw,
          0.22
        ),
        layer(circlePoints(radius * 0.25), palette[3], sw * 1.5, 0.5),
      ];
    },
  },
  {
    id: "airyDaisyLarge",
    label: "Airy Daisy Large",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.011, 0.58, 1.35);

      return [
        layer(
          rosettePoints(radius, 34, 0.88, 0.14, rotation, 2100),
          palette[0],
          sw,
          0.4
        ),
        layer(
          rosettePoints(radius * 0.78, 17, 0.72, 0.22, rotation + 5, 1700),
          palette[3],
          sw * 0.82,
          0.2
        ),
        layer(circlePoints(radius * 0.1), palette[1], sw * 1.25, 0.6),
      ];
    },
  },
  {
    id: "petalWheelTight",
    label: "Petal Wheel Tight",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.012, 0.62, 1.45);

      return [
        layer(
          rosettePoints(radius * 0.96, 26, 0.8, 0.18, rotation, 2100),
          palette[1],
          sw,
          0.48
        ),
        layer(
          rosettePoints(radius * 0.82, 13, 0.66, 0.28, rotation + 9, 1700),
          palette[0],
          sw * 0.82,
          0.28
        ),
        layer(circlePoints(radius * 0.14), palette[3], sw * 1.35, 0.55),
      ];
    },
  },
  {
    id: "openFlowerRing",
    label: "Open Flower Ring",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.011, 0.58, 1.35);

      return [
        layer(
          epitrochoidPoints(
            radius * 0.43,
            radius * 0.092,
            radius * 0.48,
            9,
            rotation,
            2400
          ),
          palette[0],
          sw,
          0.32
        ),
        layer(
          epitrochoidPoints(
            radius * 0.37,
            radius * 0.082,
            radius * 0.41,
            9,
            rotation + 7,
            2200
          ),
          palette[2],
          sw * 0.92,
          0.24
        ),
        layer(circlePoints(radius * 0.24), palette[1], sw * 1.3, 0.46),
      ];
    },
  },
  {
    id: "softSquareOrbit",
    label: "Soft Square Orbit",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.012, 0.62, 1.45);

      return [
        layer(
          superellipseOrbitPoints(radius, 4.5, 6, 0.1, rotation, 2000, 0),
          palette[0],
          sw,
          0.38
        ),
        layer(
          superellipseOrbitPoints(
            radius * 0.87,
            4.5,
            7,
            0.08,
            rotation + 15,
            1900,
            1.1
          ),
          palette[2],
          sw * 0.88,
          0.28
        ),
        layer(circlePoints(radius * 0.27), palette[1], sw * 1.25, 0.46),
      ];
    },
  },
  {
    id: "boxOrbitRosette",
    label: "Box Orbit Rosette",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.011, 0.58, 1.35);

      return [
        layer(
          superellipseOrbitPoints(
            radius * 0.98,
            5.8,
            8,
            0.18,
            rotation,
            2100,
            0.2
          ),
          palette[2],
          sw,
          0.4
        ),
        layer(
          superellipseOrbitPoints(
            radius * 0.78,
            5.2,
            8,
            0.13,
            rotation + 18,
            1900,
            0.9
          ),
          palette[0],
          sw * 0.86,
          0.28
        ),
        layer(circlePoints(radius * 0.2), palette[3], sw * 1.25, 0.48),
      ];
    },
  },
  {
    id: "roundedSquareLoose",
    label: "Rounded Square Loose",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.012, 0.62, 1.45);

      return [
        layer(
          superellipseOrbitPoints(
            radius * 0.95,
            3.7,
            5,
            0.16,
            rotation,
            1900,
            0.4
          ),
          palette[2],
          sw,
          0.3
        ),
        layer(
          superellipseOrbitPoints(
            radius * 0.83,
            3.6,
            4,
            0.12,
            rotation + 23,
            1800,
            1.5
          ),
          palette[0],
          sw,
          0.24
        ),
        layer(circlePoints(radius * 0.3), palette[1], sw * 1.15, 0.42),
      ];
    },
  },
  {
    id: "looseHandRing",
    label: "Loose Hand Ring",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.012, 0.62, 1.4);

      return [
        layer(
          irregularOrbitPoints(radius * 0.98, 7, 4, 0.12, 0.08, rotation, 2000),
          palette[0],
          sw,
          0.3
        ),
        layer(
          irregularOrbitPoints(
            radius * 0.9,
            6,
            5,
            0.1,
            0.07,
            rotation + 11,
            1900
          ),
          palette[2],
          sw * 0.9,
          0.28
        ),
        layer(
          irregularOrbitPoints(
            radius * 0.78,
            5,
            3,
            0.09,
            0.06,
            rotation + 22,
            1800
          ),
          palette[1],
          sw * 0.82,
          0.22
        ),
        layer(circlePoints(radius * 0.33), palette[3], sw * 1.15, 0.38),
      ];
    },
  },
  {
    id: "spiralVortexCluster",
    label: "Spiral Vortex Cluster",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.01, 0.52, 1.25);

      return [
        layer(
          spiralVortexPoints(radius * 0.96, 12, rotation, 2600),
          palette[2],
          sw,
          0.38,
          false
        ),
        layer(
          spiralVortexPoints(radius * 0.8, 9, rotation + 8, 2300),
          palette[0],
          sw * 0.9,
          0.26,
          false
        ),
        layer(circlePoints(radius * 0.2), palette[1], sw * 1.3, 0.42),
      ];
    },
  },
  {
    id: "lacedOrbitBloom",
    label: "Laced Orbit Bloom",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.01, 0.52, 1.25);

      return [
        layer(
          lissajousPoints(
            radius * 0.93,
            7,
            8,
            Math.PI / 2.7,
            rotation,
            2400
          ),
          palette[0],
          sw,
          0.32
        ),
        layer(
          lissajousPoints(
            radius * 0.8,
            5,
            6,
            Math.PI / 3.1,
            rotation + 10,
            2200
          ),
          palette[2],
          sw * 0.9,
          0.24
        ),
        layer(circlePoints(radius * 0.26), palette[1], sw * 1.25, 0.42),
      ];
    },
  },
  {
    id: "thinSunflower",
    label: "Thin Sunflower",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.0095, 0.5, 1.2);

      return [
        layer(
          rosettePoints(radius, 44, 0.92, 0.08, rotation, 2400),
          palette[1],
          sw,
          0.34
        ),
        layer(
          rosettePoints(radius * 0.86, 22, 0.78, 0.16, rotation + 3, 1900),
          palette[0],
          sw * 0.9,
          0.22
        ),
        layer(circlePoints(radius * 0.07), palette[3], sw * 1.35, 0.44),
      ];
    },
  },
  {
    id: "nestedGreenHalo",
    label: "Nested Green Halo",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.011, 0.58, 1.35);

      return [
        layer(circlePoints(radius * 0.92), palette[0], sw, 0.1),
        layer(circlePoints(radius * 0.78), palette[1], sw, 0.13),
        layer(circlePoints(radius * 0.64), palette[2], sw, 0.12),
        layer(
          rosettePoints(radius * 0.86, 16, 0.56, 0.32, rotation, 1700),
          palette[0],
          sw * 0.86,
          0.28
        ),
        layer(circlePoints(radius * 0.31), palette[3], sw * 1.25, 0.42),
      ];
    },
  },
  {
    id: "smallSeedRing",
    label: "Small Seed Ring",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.013, 0.62, 1.45);
      const R = radius * 0.68;
      const r = R / 8;

      return [
        layer(
          hypotrochoidPoints(R, r, radius * 0.18, 8, rotation, 1900),
          palette[3],
          sw,
          0.44
        ),
        layer(circlePoints(radius * 0.28), palette[1], sw * 1.2, 0.46),
      ];
    },
  },
  {
    id: "quietBlueGreenRing",
    label: "Quiet Blue Green Ring",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.011, 0.58, 1.35);

      return [
        layer(
          hypotrochoidPoints(
            radius * 0.74,
            radius * 0.074,
            radius * 0.26,
            10,
            rotation,
            2300
          ),
          palette[0],
          sw,
          0.36
        ),
        layer(
          lissajousPoints(
            radius * 0.7,
            6,
            7,
            Math.PI / 2.6,
            rotation + 6,
            2100
          ),
          palette[2],
          sw * 0.82,
          0.22
        ),
        layer(circlePoints(radius * 0.24), palette[3], sw * 1.2, 0.38),
      ];
    },
  },
];

function hashString(str: string) {
  let hash = 2166136261;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return Math.abs(hash >>> 0);
}

function mulberry32(seed: number) {
  let a = seed;

  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;

    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createId() {
  return `${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function dateMs(dateStr: string) {
  const ms = new Date(dateStr).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function getDesignById(id: string) {
  return DESIGN_LIBRARY.find((d) => d.id === id) ?? DESIGN_LIBRARY[0];
}

function resolveDesign(m: Milestone): DesignPreset {
  if (m.designChoice !== "auto") return getDesignById(m.designChoice);

  const seed = hashString(`${m.date}|${m.type}|${m.title}|${m.importance}`);
  return DESIGN_LIBRARY[seed % DESIGN_LIBRARY.length];
}

function getBaseRadiusByCount(count: number) {
  if (count <= 1) return 124;
  if (count <= 3) return 112;
  if (count <= 6) return 92;
  if (count <= 10) return 76;
  if (count <= 16) return 62;
  if (count <= 26) return 50;
  return 42;
}

function buildComposition(milestones: Milestone[]): ComposedMilestone[] {
  const valid = milestones
    .filter((m) => !!m.date)
    .sort((a, b) => dateMs(a.date) - dateMs(b.date));

  if (!valid.length) return [];

  const count = valid.length;
  const baseRadius = getBaseRadiusByCount(count);

  const centerX = CANVAS_W * 0.5;
  const centerY = CANVAS_H * 0.51;

  const maxSpiralRadius =
    count <= 3 ? 360 : count <= 6 ? 440 : count <= 10 ? 500 : 560;

  const items: ComposedMilestone[] = valid.map((m, index) => {
    const seed = hashString(`${m.id}|${m.date}|${m.type}|${m.title}`);
    const rnd = mulberry32(seed);

    const design = resolveDesign(m);
    const palette = TYPE_PALETTES[m.type] ?? TYPE_PALETTES.other;

    const spiralIndex = index + 1.25;
    const radialProgress =
      count === 1 ? 0 : Math.sqrt(spiralIndex) / Math.sqrt(count + 1.25);

    const angle =
      index * GOLDEN_ANGLE -
      Math.PI * 0.72 +
      (hashString(m.date) % 100) * 0.0009 +
      (rnd() - 0.5) * 0.12;

    const r = radialProgress * maxSpiralRadius;

    const x = centerX + Math.cos(angle) * r * 1.02;
    const y = centerY + Math.sin(angle) * r * 0.82;

    const importanceScale = 0.88 + clamp(m.importance, 1, 5) * 0.055;
    const typeScale = TYPE_SIZE_WEIGHT[m.type] ?? 1;
    const dateNoise = 0.94 + rnd() * 0.12;

    const radius = clamp(
      baseRadius * importanceScale * typeScale * dateNoise,
      30,
      count <= 4 ? 128 : 96
    );

    const rotation = (seed % 180) - 90;

    return {
      milestone: m,
      design,
      x,
      y,
      radius,
      rotation,
      palette,
      layers: design.render(radius, palette, rotation),
    };
  });

  for (let pass = 0; pass < 7; pass++) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(1, Math.hypot(dx, dy));

        const desired = a.radius * 0.92 + b.radius * 0.92 + 34;

        if (dist < desired) {
          const push = (desired - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;

          a.x -= nx * push * 0.35;
          b.x += nx * push * 0.35;
          a.y -= ny * push * 0.35;
          b.y += ny * push * 0.35;
        }
      }
    }

    for (const item of items) {
      const margin = item.radius + 58;

      item.x = clamp(item.x, margin, CANVAS_W - margin);
      item.y = clamp(item.y, margin, CANVAS_H - margin);
    }
  }

  return items.map((item) => ({
    ...item,
    layers: item.design.render(item.radius, item.palette, item.rotation),
  }));
}

function buildBackgroundOrbits(composition: ComposedMilestone[]) {
  if (!composition.length) return [];

  const centerX = CANVAS_W * 0.52;
  const centerY = CANVAS_H * 0.49;

  const mainColor = "#8BCDD3";
  const warmColor = "#F0AC5F";
  const darkColor = "#536176";
  const greenColor = "#93B96A";

  const layers: PathLayer[] = [];

  layers.push(
    layer(
      fibonacciSpiralPoints(
        centerX - 110,
        centerY + 20,
        7,
        0.055,
        4.6,
        -1.1,
        1.08,
        0.78,
        1200
      ),
      mainColor,
      1.2,
      0.18,
      false
    )
  );

  layers.push(
    layer(
      fibonacciSpiralPoints(
        centerX + 120,
        centerY + 20,
        8,
        0.052,
        4.35,
        1.8,
        1.12,
        0.8,
        1200
      ),
      darkColor,
      1.05,
      0.16,
      false
    )
  );

  layers.push(
    layer(
      fibonacciSpiralPoints(
        centerX - 320,
        centerY - 240,
        10,
        0.052,
        3.6,
        -2.4,
        1.25,
        0.92,
        1000
      ),
      warmColor,
      1.1,
      0.24,
      false
    )
  );

  layers.push(
    layer(
      orbitSweepPoints(
        centerX,
        centerY,
        505,
        -0.2,
        1.22,
        0.68,
        950,
        -0.55 * TAU,
        0.72 * TAU
      ),
      mainColor,
      0.9,
      0.13,
      false
    )
  );

  layers.push(
    layer(
      orbitSweepPoints(
        centerX + 90,
        centerY - 90,
        405,
        0.75,
        1.38,
        0.72,
        950,
        -0.15 * TAU,
        0.98 * TAU
      ),
      darkColor,
      0.9,
      0.1,
      false
    )
  );

  layers.push(
    layer(
      orbitSweepPoints(
        centerX - 180,
        centerY + 120,
        350,
        1.15,
        1.18,
        0.74,
        850,
        -0.2 * TAU,
        0.85 * TAU
      ),
      greenColor,
      0.8,
      0.08,
      false
    )
  );

  return layers;
}

function buildConnectorLines(composition: ComposedMilestone[]): PathLayer[] {
  if (composition.length < 2) return [];

  const sorted = [...composition].sort(
    (a, b) => dateMs(a.milestone.date) - dateMs(b.milestone.date)
  );

  const points = sorted.map((item) => ({ x: item.x, y: item.y }));

  return [
    {
      d: pointsToPath(points, false),
      stroke: "#7F8FA1",
      strokeWidth: 1,
      opacity: 0.22,
      dasharray: "8 14",
    },
  ];
}

const initialDraft: DraftMilestone = {
  title: "",
  date: "",
  type: "birth",
  importance: 3,
  designChoice: "auto",
};

export default function App() {
  const [artworkTitle, setArtworkTitle] = useState("Fibonacci Milestone Artwork");
  const [background, setBackground] = useState("#FCFCFA");
  const [showOrbits, setShowOrbits] = useState(true);
  const [showConnectors, setShowConnectors] = useState(true);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [draft, setDraft] = useState<DraftMilestone>(initialDraft);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const composition = useMemo(() => buildComposition(milestones), [milestones]);

  const backgroundOrbits = useMemo(
    () => buildBackgroundOrbits(composition),
    [composition]
  );

  const connectorLines = useMemo(
    () => buildConnectorLines(composition),
    [composition]
  );

  function addMilestone() {
    if (!draft.date) return;

    const newMilestone: Milestone = {
      id: createId(),
      title: draft.title.trim() || "Milestone",
      date: draft.date,
      type: draft.type,
      importance: clamp(Math.round(draft.importance), 1, 5),
      designChoice: draft.designChoice,
    };

    setMilestones((prev) => [...prev, newMilestone]);

    setDraft((prev) => ({
      ...prev,
      title: "",
      date: "",
      importance: 3,
      designChoice: "auto",
    }));
  }

  function removeMilestone(id: string) {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMilestone<K extends keyof Milestone>(
    id: string,
    key: K,
    value: Milestone[K]
  ) {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [key]: value } : m))
    );
  }

  function clearAll() {
    setMilestones([]);
  }

  function loadDemo() {
    setMilestones([
      {
        id: createId(),
        title: "Leah Born",
        date: "1979-03-02",
        type: "birth",
        importance: 4,
        designChoice: "airyDaisyLarge",
      },
      {
        id: createId(),
        title: "Thomas Born",
        date: "1983-07-14",
        type: "birth",
        importance: 4,
        designChoice: "greenGuillocheDonut",
      },
      {
        id: createId(),
        title: "Marriage",
        date: "2006-09-16",
        type: "marriage",
        importance: 4,
        designChoice: "softSquareOrbit",
      },
      {
        id: createId(),
        title: "Lucas Born",
        date: "2013-01-09",
        type: "birth",
        importance: 5,
        designChoice: "fineMeshHalo",
      },
      {
        id: createId(),
        title: "First Home",
        date: "2018-06-22",
        type: "home",
        importance: 3,
        designChoice: "looseHandRing",
      },
      {
        id: createId(),
        title: "Career Moment",
        date: "2024-03-01",
        type: "career",
        importance: 3,
        designChoice: "boxOrbitRosette",
      },
      {
        id: createId(),
        title: "Family Trip",
        date: "2025-08-10",
        type: "travel",
        importance: 2,
        designChoice: "smallSeedRing",
      },
    ]);
  }

  function downloadSvg() {
    if (!svgRef.current) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);

    if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
      source = source.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }

    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${
      artworkTitle.replace(/\s+/g, "-").toLowerCase() || "milestone-art"
    }.svg`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EEF1EA",
        color: "#243127",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "430px minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "#F8F9F5",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
            border: "1px solid rgba(36,49,39,0.08)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.1 }}>
            Fibonacci Milestone Art
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 18,
              color: "#5E6D62",
              lineHeight: 1.5,
              fontSize: 14,
            }}
          >
            Each date creates one fixed spirograph motif. Motifs are placed on a
            Fibonacci-based field with airy orbital sweeps and restrained modern
            spacing.
          </p>

          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Artwork Settings</div>

            <label style={labelStyle}>Artwork Title</label>
            <input
              style={inputStyle}
              value={artworkTitle}
              onChange={(e) => setArtworkTitle(e.target.value)}
              placeholder="Fibonacci Milestone Artwork"
            />

            <label style={labelStyle}>Background</label>
            <input
              style={{ ...inputStyle, height: 44, padding: 8 }}
              type="color"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            />

            <label style={toggleRowStyle}>
              <input
                type="checkbox"
                checked={showOrbits}
                onChange={(e) => setShowOrbits(e.target.checked)}
              />
              Show large Fibonacci orbit lines
            </label>

            <label style={toggleRowStyle}>
              <input
                type="checkbox"
                checked={showConnectors}
                onChange={(e) => setShowConnectors(e.target.checked)}
              />
              Show subtle timeline connector
            </label>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 14,
              }}
            >
              <button style={primaryButtonStyle} onClick={addMilestone}>
                Add Milestone
              </button>
              <button style={secondaryButtonStyle} onClick={loadDemo}>
                Load Demo
              </button>
              <button style={secondaryButtonStyle} onClick={clearAll}>
                Clear All
              </button>
              <button style={secondaryButtonStyle} onClick={downloadSvg}>
                Download SVG
              </button>
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Add Milestone</div>

            <label style={labelStyle}>Label</label>
            <input
              style={inputStyle}
              value={draft.title}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Marriage, Lucas Born, First Home"
            />

            <label style={labelStyle}>Date</label>
            <input
              type="date"
              style={inputStyle}
              value={draft.date}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, date: e.target.value }))
              }
            />

            <label style={labelStyle}>Milestone Type</label>
            <select
              style={inputStyle}
              value={draft.type}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  type: e.target.value as MilestoneType,
                }))
              }
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Design Choice</label>
            <select
              style={inputStyle}
              value={draft.designChoice}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  designChoice: e.target.value,
                }))
              }
            >
              <option value="auto">Auto Select from Library</option>
              {DESIGN_LIBRARY.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Importance: {draft.importance}</label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={draft.importance}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  importance: Number(e.target.value),
                }))
              }
              style={{ width: "100%" }}
            />
          </div>

          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Milestones ({milestones.length})</div>

            {milestones.length === 0 ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "#FFFFFF",
                  border: "1px dashed rgba(36,49,39,0.15)",
                  color: "#68766D",
                  fontSize: 14,
                }}
              >
                No milestones yet. The artwork stays blank until dates are
                entered.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {milestones.map((m) => {
                  const resolved = resolveDesign(m);

                  return (
                    <div
                      key={m.id}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid rgba(36,49,39,0.08)",
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 8,
                          alignItems: "start",
                        }}
                      >
                        <div>
                          <input
                            style={{ ...inputStyle, marginBottom: 8 }}
                            value={m.title}
                            onChange={(e) =>
                              updateMilestone(m.id, "title", e.target.value)
                            }
                          />

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 8,
                            }}
                          >
                            <input
                              type="date"
                              style={inputStyle}
                              value={m.date}
                              onChange={(e) =>
                                updateMilestone(m.id, "date", e.target.value)
                              }
                            />

                            <select
                              style={inputStyle}
                              value={m.type}
                              onChange={(e) =>
                                updateMilestone(
                                  m.id,
                                  "type",
                                  e.target.value as MilestoneType
                                )
                              }
                            >
                              {TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 110px",
                              gap: 8,
                              marginTop: 8,
                            }}
                          >
                            <select
                              style={inputStyle}
                              value={m.designChoice}
                              onChange={(e) =>
                                updateMilestone(
                                  m.id,
                                  "designChoice",
                                  e.target.value
                                )
                              }
                            >
                              <option value="auto">Auto</option>
                              {DESIGN_LIBRARY.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.label}
                                </option>
                              ))}
                            </select>

                            <select
                              style={inputStyle}
                              value={m.importance}
                              onChange={(e) =>
                                updateMilestone(
                                  m.id,
                                  "importance",
                                  Number(e.target.value)
                                )
                              }
                            >
                              {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>
                                  {`Importance ${n}`}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div
                            style={{
                              marginTop: 8,
                              color: "#657369",
                              fontSize: 12,
                            }}
                          >
                            Active motif: <strong>{resolved.label}</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => removeMilestone(m.id)}
                          style={{
                            border: "none",
                            background: "#F2F4EF",
                            color: "#58655D",
                            borderRadius: 10,
                            padding: "10px 12px",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: "#F8F9F5",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
            border: "1px solid rgba(36,49,39,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "baseline",
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                {artworkTitle}
              </div>
              <div style={{ fontSize: 13, color: "#647268", marginTop: 4 }}>
                Fibonacci composition • one date = one motif • no motif
                stretching
              </div>
            </div>

            <div style={{ color: "#647268", fontSize: 13 }}>
              {composition.length} motif{composition.length === 1 ? "" : "s"}{" "}
              generated
            </div>
          </div>

          <div
            style={{
              position: "relative",
              background: "#FFFFFF",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(36,49,39,0.08)",
            }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
                background,
              }}
            >
              <rect
                x={0}
                y={0}
                width={CANVAS_W}
                height={CANVAS_H}
                fill={background}
              />

              {showOrbits &&
                backgroundOrbits.map((l, idx) => (
                  <path
                    key={`orbit-${idx}`}
                    d={l.d}
                    fill="none"
                    stroke={l.stroke}
                    strokeWidth={l.strokeWidth}
                    strokeOpacity={l.opacity}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

              {showConnectors &&
                connectorLines.map((l, idx) => (
                  <path
                    key={`connector-${idx}`}
                    d={l.d}
                    fill="none"
                    stroke={l.stroke}
                    strokeWidth={l.strokeWidth}
                    strokeOpacity={l.opacity}
                    strokeDasharray={l.dasharray}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

              {composition.map((item) => (
                <g
                  key={item.milestone.id}
                  transform={`translate(${item.x} ${item.y})`}
                >
                  <title>
                    {item.milestone.title} • {item.design.label} •{" "}
                    {item.milestone.date}
                  </title>

                  {item.layers.map((l, idx) => (
                    <path
                      key={`${item.milestone.id}-${idx}`}
                      d={l.d}
                      fill="none"
                      stroke={l.stroke}
                      strokeWidth={l.strokeWidth}
                      strokeOpacity={l.opacity}
                      strokeDasharray={l.dasharray}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}

                  <circle
                    cx={0}
                    cy={0}
                    r={clamp(item.radius * 0.028, 2, 4)}
                    fill={item.palette[2]}
                    opacity={0.65}
                  />
                </g>
              ))}
            </svg>

            {milestones.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(36,49,39,0.08)",
                    borderRadius: 14,
                    padding: "14px 18px",
                    color: "#67756B",
                    fontSize: 14,
                    textAlign: "center",
                    maxWidth: 300,
                    lineHeight: 1.5,
                  }}
                >
                  Add milestone dates on the left.
                  <br />
                  The artwork area stays blank until dates are entered.
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={sectionTitleStyle}>Design Library</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 10,
              }}
            >
              {DESIGN_LIBRARY.map((d, i) => {
                const type = TYPE_OPTIONS[i % TYPE_OPTIONS.length].value;
                const samplePalette = TYPE_PALETTES[type] ?? TYPE_PALETTES.other;
                const sampleLayers = d.render(34, samplePalette, 0);

                return (
                  <div
                    key={d.id}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 12,
                      border: "1px solid rgba(36,49,39,0.08)",
                      padding: 10,
                    }}
                  >
                    <svg
                      viewBox="-52 -52 104 104"
                      style={{ width: "100%", height: 120 }}
                    >
                      {sampleLayers.map((l, idx) => (
                        <path
                          key={idx}
                          d={l.d}
                          fill="none"
                          stroke={l.stroke}
                          strokeWidth={l.strokeWidth}
                          strokeOpacity={l.opacity}
                          strokeDasharray={l.dasharray}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}
                    </svg>

                    <div style={{ fontSize: 12, fontWeight: 700 }}>
                      {d.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#68766D",
                        marginTop: 4,
                      }}
                    >
                      ID: {d.id}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.75)",
  border: "1px solid rgba(36,49,39,0.08)",
  borderRadius: 16,
  padding: 14,
  marginBottom: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  marginBottom: 12,
  color: "#314036",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 6,
  marginTop: 10,
  color: "#4E5C53",
};

const toggleRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  fontSize: 13,
  fontWeight: 700,
  marginTop: 12,
  color: "#4E5C53",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid rgba(36,49,39,0.12)",
  background: "#FFFFFF",
  color: "#223026",
  fontSize: 14,
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  background: "#304237",
  color: "#FFFFFF",
  borderRadius: 10,
  padding: "11px 14px",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(36,49,39,0.12)",
  background: "#FFFFFF",
  color: "#304237",
  borderRadius: 10,
  padding: "11px 14px",
  cursor: "pointer",
  fontWeight: 700,
};
