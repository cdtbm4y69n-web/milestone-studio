import React, { useMemo, useRef, useState } from "react";

type MilestoneType =
  | "couple_met"
  | "first_date"
  | "engagement"
  | "marriage"
  | "anniversary"
  | "birth"
  | "child_born"
  | "adoption"
  | "pregnancy"
  | "pet"
  | "first_home"
  | "new_home"
  | "family_vacation"
  | "travel"
  | "graduation"
  | "career"
  | "new_job"
  | "promotion"
  | "business"
  | "retirement"
  | "memorial"
  | "loss"
  | "personal_milestone"
  | "faith"
  | "other";

type ColorSchemeId =
  | "botanical"
  | "coastal"
  | "marigold"
  | "sageInk"
  | "mineral"
  | "warmNeutral";

type MotifRole = "hero" | "secondary" | "supporting" | "accent";

type Milestone = {
  id: string;
  title: string;
  date: string;
  type: MilestoneType;
};

type DraftMilestone = {
  title: string;
  date: string;
  type: MilestoneType;
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
  role: MotifRole;
  x: number;
  y: number;
  radius: number;
  rotation: number;
  palette: string[];
  layers: PathLayer[];
};

type HeroMotif = {
  id: string;
  x: number;
  y: number;
  layers: PathLayer[];
};

type ColorScheme = {
  id: ColorSchemeId;
  label: string;
  background: string;
  motif: string[];
  orbit: string[];
  connector: string;
  dot: string;
};

const CANVAS_W = 1400;
const CANVAS_H = 1400;
const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;

const TYPE_OPTIONS: { value: MilestoneType; label: string }[] = [
  { value: "couple_met", label: "Couple Met" },
  { value: "first_date", label: "First Date" },
  { value: "engagement", label: "Engagement" },
  { value: "marriage", label: "Married" },
  { value: "anniversary", label: "Anniversary" },
  { value: "birth", label: "Birth" },
  { value: "child_born", label: "Child Born" },
  { value: "adoption", label: "Adoption" },
  { value: "pregnancy", label: "Pregnancy / Baby News" },
  { value: "pet", label: "Pet Joined the Family" },
  { value: "first_home", label: "First Home" },
  { value: "new_home", label: "New Home / Move" },
  { value: "family_vacation", label: "Family Vacation" },
  { value: "travel", label: "Travel / Adventure" },
  { value: "graduation", label: "Graduation" },
  { value: "career", label: "Career Milestone" },
  { value: "new_job", label: "New Job" },
  { value: "promotion", label: "Promotion" },
  { value: "business", label: "Started a Business" },
  { value: "retirement", label: "Retirement" },
  { value: "memorial", label: "Memorial / Remembering" },
  { value: "loss", label: "Loss / Difficult Season" },
  { value: "personal_milestone", label: "Personal Milestone" },
  { value: "faith", label: "Faith / Spiritual Milestone" },
  { value: "other", label: "Other" },
];

const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "botanical",
    label: "Botanical Greens",
    background: "#FCFCFA",
    motif: ["#8FC7A5", "#B7CB63", "#6A8F80", "#4F6F61"],
    orbit: ["#9ED1D0", "#B8C98A", "#708B84", "#D8E6D6"],
    connector: "#7C8E86",
    dot: "#536F64",
  },
  {
    id: "coastal",
    label: "Coastal Blue",
    background: "#FBFCFC",
    motif: ["#9DCFD5", "#7FA9BB", "#566B83", "#D7B56D"],
    orbit: ["#A8DCE2", "#D8EDF0", "#5D7288", "#EAC878"],
    connector: "#8192A3",
    dot: "#536176",
  },
  {
    id: "marigold",
    label: "Marigold + Sky",
    background: "#FFFDF8",
    motif: ["#F0B35D", "#F3C84D", "#94CED2", "#536176"],
    orbit: ["#F3B36A", "#A8DDE1", "#667286", "#F7E2A1"],
    connector: "#9A9688",
    dot: "#546176",
  },
  {
    id: "sageInk",
    label: "Sage + Ink",
    background: "#FCFCFA",
    motif: ["#A8BFA4", "#7B998A", "#4F5F70", "#CED9C9"],
    orbit: ["#B9D4C8", "#AABCB0", "#536176", "#DDE6DA"],
    connector: "#7A8583",
    dot: "#4F5F70",
  },
  {
    id: "mineral",
    label: "Mineral Mist",
    background: "#FBFCFA",
    motif: ["#B6C9C6", "#8EA7A8", "#C9C08A", "#687080"],
    orbit: ["#C4DDDA", "#DAD8BD", "#7E8999", "#EFF3EE"],
    connector: "#919B9B",
    dot: "#667080",
  },
  {
    id: "warmNeutral",
    label: "Warm Neutral",
    background: "#FFFDF8",
    motif: ["#C9A66B", "#A8B98D", "#7F8C7D", "#D9C7A4"],
    orbit: ["#E4C98E", "#C9D6B8", "#A6B1A4", "#EFE5D1"],
    connector: "#9B9587",
    dot: "#756F63",
  },
];

function getColorScheme(id: ColorSchemeId) {
  return COLOR_SCHEMES.find((scheme) => scheme.id === id) ?? COLOR_SCHEMES[0];
}

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
  steps = 1200
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
    const wobble = 1 + 0.045 * Math.sin(3 * t + rotation);

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
    id: "guillocheDonut",
    label: "Guilloche Donut",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.0105, 0.7, 1.8);
      const R = radius * 0.78;
      const r = R / 11;

      return [
        layer(
          hypotrochoidPoints(R, r, radius * 0.28, 11, rotation, 2600),
          palette[1],
          sw,
          0.56
        ),
        layer(
          hypotrochoidPoints(
            R * 0.95,
            r,
            radius * 0.23,
            11,
            rotation + 8,
            2400
          ),
          palette[0],
          sw * 0.92,
          0.34
        ),
        layer(circlePoints(radius * 0.3), palette[3], sw * 1.18, 0.5),
      ];
    },
  },
  {
    id: "fineMeshHalo",
    label: "Fine Mesh Halo",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.008, 0.65, 1.45);

      return [
        layer(
          radialThreadDiskPoints(radius * 0.94, 43, 151, rotation),
          palette[0],
          sw,
          0.42
        ),
        layer(
          radialThreadDiskPoints(radius * 0.84, 37, 137, rotation + 4),
          palette[2],
          sw,
          0.22
        ),
        layer(circlePoints(radius * 0.24), palette[3], sw * 1.2, 0.5),
      ];
    },
  },
  {
    id: "airyDaisy",
    label: "Airy Daisy",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.0105, 0.7, 1.7);

      return [
        layer(
          rosettePoints(radius, 34, 0.88, 0.14, rotation, 2100),
          palette[0],
          sw,
          0.4
        ),
        layer(
          rosettePoints(radius * 0.78, 17, 0.72, 0.22, rotation + 6, 1700),
          palette[3],
          sw * 0.82,
          0.2
        ),
        layer(circlePoints(radius * 0.1), palette[1], sw * 1.1, 0.6),
      ];
    },
  },
  {
    id: "petalWheel",
    label: "Petal Wheel",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.011, 0.72, 1.8);

      return [
        layer(
          rosettePoints(radius * 0.98, 26, 0.8, 0.18, rotation, 2100),
          palette[1],
          sw,
          0.5
        ),
        layer(
          rosettePoints(radius * 0.82, 13, 0.66, 0.28, rotation + 8, 1700),
          palette[0],
          sw * 0.8,
          0.28
        ),
        layer(circlePoints(radius * 0.14), palette[3], sw * 1.1, 0.55),
      ];
    },
  },
  {
    id: "openFlowerRing",
    label: "Open Flower Ring",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.0105, 0.72, 1.7);

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
          0.34
        ),
        layer(
          epitrochoidPoints(
            radius * 0.37,
            radius * 0.082,
            radius * 0.41,
            9,
            rotation + 8,
            2200
          ),
          palette[2],
          sw * 0.92,
          0.24
        ),
        layer(circlePoints(radius * 0.24), palette[1], sw * 1.15, 0.48),
      ];
    },
  },
  {
    id: "softSquareOrbit",
    label: "Soft Square Orbit",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.011, 0.72, 1.7);

      return [
        layer(
          superellipseOrbitPoints(radius, 4.5, 6, 0.1, rotation, 2000, 0),
          palette[0],
          sw,
          0.4
        ),
        layer(
          superellipseOrbitPoints(
            radius * 0.87,
            4.5,
            7,
            0.08,
            rotation + 14,
            1900,
            1.1
          ),
          palette[2],
          sw * 0.86,
          0.28
        ),
        layer(circlePoints(radius * 0.27), palette[1], sw * 1.05, 0.46),
      ];
    },
  },
  {
    id: "boxOrbitRosette",
    label: "Box Orbit Rosette",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.0105, 0.68, 1.65);

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
          0.42
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
        layer(circlePoints(radius * 0.2), palette[3], sw * 1.08, 0.5),
      ];
    },
  },
  {
    id: "looseHandRing",
    label: "Loose Hand Ring",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.011, 0.72, 1.65);

      return [
        layer(
          irregularOrbitPoints(radius * 0.98, 7, 4, 0.12, 0.08, rotation, 2000),
          palette[0],
          sw,
          0.34
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
          0.3
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
          sw * 0.8,
          0.22
        ),
        layer(circlePoints(radius * 0.33), palette[3], sw * 1.1, 0.38),
      ];
    },
  },
  {
    id: "spiralVortex",
    label: "Spiral Vortex",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.0095, 0.68, 1.6);

      return [
        layer(
          spiralVortexPoints(radius * 0.98, 12, rotation, 2600),
          palette[2],
          sw,
          0.42,
          false
        ),
        layer(
          spiralVortexPoints(radius * 0.82, 9, rotation + 7, 2300),
          palette[0],
          sw * 0.9,
          0.28,
          false
        ),
        layer(circlePoints(radius * 0.2), palette[1], sw * 1.18, 0.42),
      ];
    },
  },
  {
    id: "lacedOrbitBloom",
    label: "Laced Orbit Bloom",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.0095, 0.68, 1.55);

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
          0.36
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
          sw * 0.88,
          0.24
        ),
        layer(circlePoints(radius * 0.26), palette[1], sw * 1.18, 0.42),
      ];
    },
  },
  {
    id: "thinSunflower",
    label: "Thin Sunflower",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.0092, 0.65, 1.45);

      return [
        layer(
          rosettePoints(radius, 44, 0.92, 0.08, rotation, 2400),
          palette[1],
          sw,
          0.38
        ),
        layer(
          rosettePoints(radius * 0.86, 22, 0.78, 0.16, rotation + 3, 1900),
          palette[0],
          sw * 0.88,
          0.22
        ),
        layer(circlePoints(radius * 0.07), palette[3], sw * 1.25, 0.42),
      ];
    },
  },
  {
    id: "nestedHalo",
    label: "Nested Halo",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.0105, 0.68, 1.6);

      return [
        layer(circlePoints(radius * 0.92), palette[0], sw, 0.12),
        layer(circlePoints(radius * 0.78), palette[1], sw, 0.14),
        layer(circlePoints(radius * 0.64), palette[2], sw, 0.12),
        layer(
          rosettePoints(radius * 0.86, 16, 0.56, 0.32, rotation, 1700),
          palette[0],
          sw * 0.84,
          0.3
        ),
        layer(circlePoints(radius * 0.31), palette[3], sw * 1.16, 0.42),
      ];
    },
  },
  {
    id: "smallSeedRing",
    label: "Small Seed Ring",
    render: (radius, palette, rotation) => {
      const sw = clamp(radius * 0.012, 0.72, 1.8);
      const R = radius * 0.68;
      const r = R / 8;

      return [
        layer(
          hypotrochoidPoints(R, r, radius * 0.18, 8, rotation, 1900),
          palette[3],
          sw,
          0.46
        ),
        layer(circlePoints(radius * 0.28), palette[1], sw * 1.15, 0.48),
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

function resolveDesign(m: Milestone) {
  const seed = hashString(`${m.date}|${m.type}|${m.title}`);
  return DESIGN_LIBRARY[seed % DESIGN_LIBRARY.length];
}

function getBaseRadiusByCount(count: number) {
  if (count <= 1) return 172;
  if (count <= 3) return 132;
  if (count <= 5) return 118;
  if (count <= 8) return 104;
  if (count <= 12) return 92;
  if (count <= 18) return 82;
  return 74;
}

function getMilestoneTypeWeight(type: MilestoneType) {
  switch (type) {
    case "couple_met":
    case "first_date":
    case "engagement":
    case "marriage":
      return 1.1;

    case "birth":
    case "child_born":
    case "adoption":
    case "pregnancy":
      return 1.08;

    case "anniversary":
      return 1.03;

    case "first_home":
    case "new_home":
    case "retirement":
    case "memorial":
      return 1.02;

    case "pet":
    case "family_vacation":
    case "travel":
      return 0.96;

    case "graduation":
    case "career":
    case "new_job":
    case "promotion":
    case "business":
      return 0.98;

    default:
      return 0.98;
  }
}

function getMotifRole(index: number, count: number): MotifRole {
  const centerIndex = Math.floor((count - 1) / 2);

  if (index === centerIndex) return "hero";

  if (
    index === count - 1 ||
    index === Math.max(0, Math.floor(count * 0.28))
  ) {
    return "secondary";
  }

  if (
    index === 0 ||
    index === Math.max(0, Math.floor(count * 0.72)) ||
    index === Math.max(0, Math.floor(count * 0.16))
  ) {
    return "supporting";
  }

  return "accent";
}

function renderAccentMotif(
  radius: number,
  palette: string[],
  rotation: number
): PathLayer[] {
  const sw = clamp(radius * 0.035, 0.7, 1.4);

  const outer = circlePoints(radius * 0.9);
  const inner = circlePoints(radius * 0.42);
  const dot = circlePoints(radius * 0.12);

  return [
    layer(outer.map((p) => rotatePoint(p, rotation)), palette[0], sw, 0.34),
    layer(inner.map((p) => rotatePoint(p, rotation)), palette[2], sw * 0.85, 0.26),
    layer(dot.map((p) => rotatePoint(p, rotation)), palette[3], sw * 1.2, 0.5),
  ];
}

function getDateDrivenScale(
  m: Milestone,
  index: number,
  dates: number[]
) {
  const count = dates.length;

  if (count === 1) return 1.16;

  const current = dates[index];
  const span = Math.max(1, dates[count - 1] - dates[0]);
  const avgGap = span / Math.max(1, count - 1);

  const before = index === 0 ? avgGap : current - dates[index - 1];
  const after = index === count - 1 ? avgGap : dates[index + 1] - current;

  const isolation = clamp((before + after) / (2 * avgGap), 0.82, 1.24);
  const typeWeight = getMilestoneTypeWeight(m.type);
  const dateSeed = hashString(m.date);
  const dateTexture = 0.94 + ((dateSeed % 100) / 100) * 0.12;

  return isolation * typeWeight * dateTexture;
}

function softenLayers(
  layers: PathLayer[],
  opacityFactor = 0.75,
  strokeFactor = 1
) {
  return layers.map((l) => ({
    ...l,
    opacity: Math.min(0.44, l.opacity * opacityFactor),
    strokeWidth: l.strokeWidth * strokeFactor,
  }));
}

function strengthenLayers(
  layers: PathLayer[],
  opacityFactor = 1.18,
  strokeFactor = 1.08
) {
  return layers.map((l) => ({
    ...l,
    opacity: Math.min(0.76, l.opacity * opacityFactor),
    strokeWidth: l.strokeWidth * strokeFactor,
  }));
}

function buildComposition(
  milestones: Milestone[],
  colorScheme: ColorScheme
): ComposedMilestone[] {
  const valid = milestones
    .filter((m) => !!m.date)
    .sort((a, b) => dateMs(a.date) - dateMs(b.date));

  if (!valid.length) return [];

  const count = valid.length;
  const baseRadius = getBaseRadiusByCount(count);
  const dates = valid.map((m) => dateMs(m.date));
  const centerIndex = Math.floor((count - 1) / 2);

  type Slot = {
    x: number;
    y: number;
    scale: number;
    jitter: number;
  };

  const slots = new Map<number, Slot>();

  const put = (idx: number, slot: Slot) => {
    if (idx >= 0 && idx < count && !slots.has(idx)) slots.set(idx, slot);
  };

  put(centerIndex, {
    x: CANVAS_W * 0.56,
    y: CANVAS_H * 0.58,
    scale: 2.18,
    jitter: 10,
  });

  put(count - 1, {
    x: CANVAS_W * 0.87,
    y: CANVAS_H * 0.36,
    scale: 1.32,
    jitter: 14,
  });

  put(Math.max(0, Math.floor(count * 0.28)), {
    x: CANVAS_W * 0.3,
    y: CANVAS_H * 0.67,
    scale: 1.1,
    jitter: 14,
  });

  put(Math.max(0, Math.floor(count * 0.72)), {
    x: CANVAS_W * 0.83,
    y: CANVAS_H * 0.86,
    scale: 0.62,
    jitter: 12,
  });

  put(0, {
    x: CANVAS_W * 0.49,
    y: CANVAS_H * 0.05,
    scale: 0.64,
    jitter: 8,
  });

  put(Math.max(0, Math.floor(count * 0.16)), {
    x: CANVAS_W * 0.69,
    y: CANVAS_H * 0.15,
    scale: 0.62,
    jitter: 12,
  });

  const spareSlots: Slot[] = [
    { x: CANVAS_W * 0.24, y: CANVAS_H * 0.46, scale: 0.34, jitter: 12 },
    { x: CANVAS_W * 0.18, y: CANVAS_H * 0.9, scale: 0.28, jitter: 10 },
    { x: CANVAS_W * 0.98, y: CANVAS_H * 0.23, scale: 0.3, jitter: 10 },
    { x: CANVAS_W * 0.73, y: CANVAS_H * 0.73, scale: 0.34, jitter: 12 },
    { x: CANVAS_W * 0.12, y: CANVAS_H * 0.36, scale: 0.32, jitter: 10 },
    { x: CANVAS_W * 0.6, y: CANVAS_H * 0.18, scale: 0.28, jitter: 10 },
    { x: CANVAS_W * 0.38, y: CANVAS_H * 0.24, scale: 0.3, jitter: 10 },
    { x: CANVAS_W * 0.92, y: CANVAS_H * 0.58, scale: 0.28, jitter: 10 },
  ];

  let spareCursor = 0;

  const items: ComposedMilestone[] = valid.map((m, index) => {
    const seed = hashString(`${m.id}|${m.date}|${m.type}|${m.title}`);
    const rnd = mulberry32(seed);

    const design = resolveDesign(m);
    const palette = colorScheme.motif;
    const role = getMotifRole(index, count);

    const slot =
      slots.get(index) ?? spareSlots[(spareCursor++) % spareSlots.length];

    const roleScale =
      role === "hero"
        ? 2.15
        : role === "secondary"
        ? 1.25
        : role === "supporting"
        ? 0.72
        : 0.28;

    const x = slot.x + (rnd() - 0.5) * slot.jitter * 2;
    const y = slot.y + (rnd() - 0.5) * slot.jitter * 2;

    const radius = clamp(
      baseRadius * getDateDrivenScale(m, index, dates) * roleScale,
      role === "accent" ? 16 : 34,
      role === "hero"
        ? 285
        : role === "secondary"
        ? 190
        : role === "supporting"
        ? 105
        : 34
    );

    const rotation = (seed % 180) - 90;

    const rawLayers =
      role === "accent"
        ? renderAccentMotif(radius, palette, rotation)
        : design.render(radius, palette, rotation);

    const layers =
      role === "hero"
        ? strengthenLayers(rawLayers, 1.22, 1.1)
        : role === "secondary"
        ? strengthenLayers(rawLayers, 1.08, 1.04)
        : role === "supporting"
        ? rawLayers.map((l) => ({ ...l, opacity: l.opacity * 0.9 }))
        : rawLayers.map((l) => ({ ...l, opacity: l.opacity * 0.78 }));

    return {
      milestone: m,
      design,
      role,
      x,
      y,
      radius,
      rotation,
      palette,
      layers,
    };
  });

  if (count > 1) {
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];

          if (a.role === "accent" || b.role === "accent") continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const desired = a.radius * 0.36 + b.radius * 0.36;

          if (dist < desired) {
            const push = (desired - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;

            a.x -= nx * push * 0.1;
            b.x += nx * push * 0.1;
            a.y -= ny * push * 0.1;
            b.y += ny * push * 0.1;
          }
        }
      }

      for (const item of items) {
        item.x = clamp(
          item.x,
          -item.radius * 0.58,
          CANVAS_W + item.radius * 0.58
        );
        item.y = clamp(
          item.y,
          -item.radius * 0.52,
          CANVAS_H + item.radius * 0.52
        );
      }
    }
  }

  return items;
}

function buildBackgroundOrbits(
  composition: ComposedMilestone[],
  colorScheme: ColorScheme
) {
  if (composition.length < 3) return [];

  const [a, b, c] = colorScheme.orbit;

  return [
    layer(
      orbitSweepPoints(
        -190,
        CANVAS_H * 0.34,
        470,
        0.04,
        1.18,
        0.94,
        1000,
        -0.18 * TAU,
        1.16 * TAU
      ),
      b,
      2.3,
      0.32,
      false
    ),
    layer(
      orbitSweepPoints(
        CANVAS_W * 1.05,
        CANVAS_H * 0.43,
        500,
        2.62,
        0.72,
        1.22,
        1100,
        -0.1 * TAU,
        1.18 * TAU
      ),
      c,
      2.25,
      0.38,
      false
    ),
    layer(
      orbitSweepPoints(
        CANVAS_W * 0.46,
        CANVAS_H * 1.08,
        535,
        -1.58,
        1.24,
        0.82,
        1100,
        -0.18 * TAU,
        1.0 * TAU
      ),
      a,
      1.7,
      0.14,
      false
    ),
  ];
}

function buildHeroBackgroundMotifs(
  composition: ComposedMilestone[],
  colorScheme: ColorScheme
): HeroMotif[] {
  if (composition.length < 5) return [];

  const p = colorScheme.motif;
  const o = colorScheme.orbit;

  const leftHero = DESIGN_LIBRARY.find((d) => d.id === "thinSunflower");
  const rightHero = DESIGN_LIBRARY.find((d) => d.id === "looseHandRing");

  if (!leftHero || !rightHero) return [];

  return [
    {
      id: "hero-left",
      x: -42,
      y: CANVAS_H * 0.74,
      layers: softenLayers(
        leftHero.render(330, [p[1], o[3], p[1], p[1]], -18),
        0.78,
        1.1
      ),
    },
    {
      id: "hero-right",
      x: CANVAS_W * 0.92,
      y: CANVAS_H * 0.43,
      layers: softenLayers(
        rightHero.render(360, [o[0], o[0], p[2], p[2]], 18),
        0.82,
        1.12
      ),
    },
  ];
}

function buildConnectorLines(
  composition: ComposedMilestone[],
  colorScheme: ColorScheme
): PathLayer[] {
  const major = composition
    .filter((item) => item.role !== "accent")
    .sort((a, b) => dateMs(a.milestone.date) - dateMs(b.milestone.date));

  if (major.length < 3) return [];

  const hub =
    major.find((item) => item.role === "hero") ?? major[Math.floor(major.length / 2)];

  const targets = major.filter((item) => item !== hub).slice(0, 3);

  return targets.map((target, i) => ({
    d: `M ${fmt(hub.x)} ${fmt(hub.y)} L ${fmt(target.x)} ${fmt(target.y)}`,
    stroke: colorScheme.connector,
    strokeWidth: i === 0 ? 1.1 : 0.95,
    opacity: 0.1,
    dasharray: "26 34",
  }));
}

const initialDraft: DraftMilestone = {
  title: "",
  date: "",
  type: "couple_met",
};

export default function App() {
  const [artworkTitle, setArtworkTitle] = useState(
    "Fibonacci Milestone Artwork"
  );
  const [colorSchemeId, setColorSchemeId] =
    useState<ColorSchemeId>("botanical");
  const [showOrbits, setShowOrbits] = useState(true);
  const [showConnectors, setShowConnectors] = useState(true);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [draft, setDraft] = useState<DraftMilestone>(initialDraft);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const colorScheme = useMemo(
    () => getColorScheme(colorSchemeId),
    [colorSchemeId]
  );

  const composition = useMemo(
    () => buildComposition(milestones, colorScheme),
    [milestones, colorScheme]
  );

  const motifCount = composition.length;
  const hasMilestones = motifCount > 0;
  const showConnectorLayer = motifCount >= 3 && showConnectors;
  const showOrbitLayer = motifCount >= 3 && showOrbits;
  const showHeroLayer = motifCount >= 5 && showOrbits;

  const backgroundOrbits = useMemo(
    () =>
      motifCount >= 3 ? buildBackgroundOrbits(composition, colorScheme) : [],
    [motifCount, composition, colorScheme]
  );

  const heroBackgroundMotifs = useMemo(
    () =>
      motifCount >= 5
        ? buildHeroBackgroundMotifs(composition, colorScheme)
        : [],
    [motifCount, composition, colorScheme]
  );

  const connectorLines = useMemo(
    () =>
      motifCount >= 3 ? buildConnectorLines(composition, colorScheme) : [],
    [motifCount, composition, colorScheme]
  );

  function addMilestone() {
    if (!draft.date) return;

    const selectedType = TYPE_OPTIONS.find((opt) => opt.value === draft.type);

    const newMilestone: Milestone = {
      id: createId(),
      title: draft.title.trim() || selectedType?.label || "Milestone",
      date: draft.date,
      type: draft.type,
    };

    setMilestones((prev) => [...prev, newMilestone]);

    setDraft((prev) => ({
      ...prev,
      title: "",
      date: "",
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
        title: "Couple Met",
        date: "2004-04-18",
        type: "couple_met",
      },
      {
        id: createId(),
        title: "First Date",
        date: "2004-05-07",
        type: "first_date",
      },
      {
        id: createId(),
        title: "Engagement",
        date: "2005-11-12",
        type: "engagement",
      },
      {
        id: createId(),
        title: "Married",
        date: "2006-09-16",
        type: "marriage",
      },
      {
        id: createId(),
        title: "Lucas Born",
        date: "2013-01-09",
        type: "child_born",
      },
      {
        id: createId(),
        title: "First Home",
        date: "2018-06-22",
        type: "first_home",
      },
      {
        id: createId(),
        title: "Family Vacation",
        date: "2025-08-10",
        type: "family_vacation",
      },
      {
        id: createId(),
        title: "New Job",
        date: "2026-03-01",
        type: "new_job",
      },
      {
        id: createId(),
        title: "Anniversary",
        date: "2026-09-16",
        type: "anniversary",
      },
      {
        id: createId(),
        title: "Retirement",
        date: "2040-06-01",
        type: "retirement",
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
        <div style={panelStyle}>
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
            Enter meaningful dates. The artwork automatically translates them
            into a Fibonacci-based composition with hero, supporting, and accent
            milestones.
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

            <label style={labelStyle}>Color Scheme</label>
            <select
              style={inputStyle}
              value={colorSchemeId}
              onChange={(e) =>
                setColorSchemeId(e.target.value as ColorSchemeId)
              }
            >
              {COLOR_SCHEMES.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.label}
                </option>
              ))}
            </select>

            <label style={toggleRowStyle}>
              <input
                type="checkbox"
                checked={showOrbits}
                onChange={(e) => setShowOrbits(e.target.checked)}
              />
              Show large orbit lines
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

            <label style={labelStyle}>Label</label>
            <input
              style={inputStyle}
              value={draft.title}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Optional, e.g. Our First Date"
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
                {milestones.map((m) => (
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
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={panelStyle}>
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
                Fibonacci composition • hero/support/accent hierarchy • global
                color scheme
              </div>
            </div>

            <div style={{ color: "#647268", fontSize: 13 }}>
              {motifCount} milestone{motifCount === 1 ? "" : "s"} generated
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
                background: colorScheme.background,
              }}
            >
              <rect
                x={0}
                y={0}
                width={CANVAS_W}
                height={CANVAS_H}
                fill={colorScheme.background}
              />

              {showOrbitLayer &&
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

              {showHeroLayer &&
                heroBackgroundMotifs.map((hero) => (
                  <g key={hero.id} transform={`translate(${hero.x} ${hero.y})`}>
                    {hero.layers.map((l, idx) => (
                      <path
                        key={`${hero.id}-${idx}`}
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
                  </g>
                ))}

              {showConnectorLayer &&
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

              {hasMilestones &&
                composition.map((item) => (
                  <g
                    key={item.milestone.id}
                    transform={`translate(${item.x} ${item.y})`}
                  >
                    <title>
                      {item.milestone.title} • {item.milestone.date} •{" "}
                      {item.role}
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
                      r={clamp(item.radius * 0.025, 1.8, 5)}
                      fill={colorScheme.dot}
                      opacity={item.role === "accent" ? 0.42 : 0.68}
                    />
                  </g>
                ))}
            </svg>

            {!hasMilestones && (
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
                    maxWidth: 320,
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
        </div>
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: "#F8F9F5",
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
  border: "1px solid rgba(36,49,39,0.08)",
};

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
