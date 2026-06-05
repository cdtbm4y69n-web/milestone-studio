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
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

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
  return COLOR_SCHEMES.find((s) => s.id === id) ?? COLOR_SCHEMES[0];
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
          palette
