import React, { useMemo, useState } from "react";

type MilestoneType =
  | "birth"
  | "firstDate"
  | "engagement"
  | "marriage"
  | "child"
  | "home"
  | "anniversary10"
  | "anniversary20"
  | "graduation"
  | "career"
  | "memorial";

type DesignId =
  | "donutMesh"
  | "wovenRing"
  | "softRosette"
  | "longPetal"
  | "starLoop"
  | "angularOrbit"
  | "openOrbit"
  | "denseCenter"
  | "thinHalo"
  | "nestedRing"
  | "spiralWhorl"
  | "smallDaisy";

type Milestone = {
  id: string;
  type: MilestoneType;
  date: string;
};

type ArtworkMark = Milestone & {
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  design: DesignId;
  seed: number;
  holeRatio: number;
  density: number;
};

const EVENT_LABELS: Record<MilestoneType, string> = {
  birth: "Birth",
  firstDate: "First Date",
  engagement: "Engagement",
  marriage: "Marriage",
  child: "Child",
  home: "Home Purchase",
  anniversary10: "10th Anniversary",
  anniversary20: "20th Anniversary",
  graduation: "Graduation",
  career: "Career",
  memorial: "Memorial",
};

const MONTH_COLORS = [
  "#14304a",
  "#7b5a8e",
  "#6f8067",
  "#a8b26d",
  "#7fb069",
  "#6fae8e",
  "#a94f3d",
  "#c98252",
  "#4f8a91",
  "#7d9448",
  "#8f483b",
  "#8fa28f",
];

const DESIGN_LIBRARY: Record<
  DesignId,
  {
    label: string;
    mode: "hypo" | "epi" | "rose" | "whorl";
    basePetals: number;
    cycles: number;
    layers: number;
    offset: number;
    sx: number;
    sy: number;
    stroke: number;
    opacity: number;
    hasHole: boolean;
  }
> = {
  donutMesh: {
    label: "Dense Donut Mesh",
    mode: "hypo",
    basePetals: 42,
    cycles: 22,
    layers: 7,
    offset: 0.62,
    sx: 1,
    sy: 1,
    stroke: 0.82,
    opacity: 0.58,
    hasHole: true,
  },
  wovenRing: {
    label: "Woven Ring",
    mode: "hypo",
    basePetals: 30,
    cycles: 18,
    layers: 5,
    offset: 0.68,
    sx: 1.08,
    sy: 0.96,
    stroke: 0.9,
    opacity: 0.6,
    hasHole: true,
  },
  softRosette: {
    label: "Soft Rosette",
    mode: "rose",
    basePetals: 18,
    cycles: 12,
    layers: 4,
    offset: 0.72,
    sx: 1,
    sy: 1,
    stroke: 1.05,
    opacity: 0.68,
    hasHole: true,
  },
  longPetal: {
    label: "Long Petal Flower",
    mode: "rose",
    basePetals: 22,
    cycles: 10,
    layers: 3,
    offset: 0.95,
    sx: 1.12,
    sy: 1.02,
    stroke: 1.08,
    opacity: 0.66,
    hasHole: true,
  },
  starLoop: {
    label: "Star Loop",
    mode: "epi",
    basePetals: 7,
    cycles: 9,
    layers: 4,
    offset: 1.04,
    sx: 1.08,
    sy: 1.02,
    stroke: 1.12,
    opacity: 0.68,
    hasHole: true,
  },
  angularOrbit: {
    label: "Angular Orbit",
    mode: "epi",
    basePetals: 9,
    cycles: 8,
    layers: 3,
    offset: 1.1,
    sx: 1.22,
    sy: 0.9,
    stroke: 1.08,
    opacity: 0.66,
    hasHole: true,
  },
  openOrbit: {
    label: "Open Orbit",
    mode: "epi",
    basePetals: 5,
    cycles: 7,
    layers: 3,
    offset: 1.32,
    sx: 1.65,
    sy: 0.72,
    stroke: 1.15,
    opacity: 0.67,
    hasHole: true,
  },
  denseCenter: {
    label: "Dense Center Bloom",
    mode: "hypo",
    basePetals: 56,
    cycles: 24,
    layers: 8,
    offset: 0.72,
    sx: 1,
    sy: 1,
    stroke: 0.72,
    opacity: 0.55,
    hasHole: true,
  },
  thinHalo: {
    label: "Thin Halo",
    mode: "hypo",
    basePetals: 26,
    cycles: 16,
    layers: 3,
    offset: 0.54,
    sx: 1.05,
    sy: 1.05,
    stroke: 0.86,
    opacity: 0.54,
    hasHole: true,
  },
  nestedRing: {
    label: "Nested Ring",
    mode: "hypo",
    basePetals: 20,
    cycles: 14,
    layers: 5,
    offset: 0.58,
    sx: 1.18,
    sy: 0.98,
    stroke: 0.92,
    opacity: 0.58,
    hasHole: true,
  },
  spiralWhorl: {
    label: "Spiral Whorl",
    mode: "whorl",
    basePetals: 12,
    cycles: 13,
    layers: 5,
    offset: 0.82,
    sx: 1.08,
    sy: 1.05,
    stroke: 0.92,
    opacity: 0.58,
    hasHole: true,
  },
  smallDaisy: {
    label: "Small Daisy",
    mode: "rose",
    basePetals: 12,
    cycles: 8,
    layers: 3,
    offset: 0.78,
    sx: 1,
    sy: 1,
    stroke: 1.02,
    opacity: 0.64,
    hasHole: true,
  },
};

const TYPE_DESIGNS: Record<MilestoneType, DesignId[]> = {
  birth: ["softRosette", "longPetal", "donutMesh", "smallDaisy"],
  firstDate: ["openOrbit", "angularOrbit", "starLoop"],
  engagement: ["nestedRing", "openOrbit", "wovenRing"],
  marriage: ["donutMesh", "wovenRing", "nestedRing"],
  child: ["smallDaisy", "softRosette", "thinHalo", "longPetal"],
  home: ["spiralWhorl", "angularOrbit", "nestedRing"],
  anniversary10: ["thinHalo", "wovenRing", "starLoop"],
  anniversary20: ["donutMesh", "denseCenter", "wovenRing"],
  graduation: ["starLoop", "angularOrbit", "longPetal"],
  career: ["angularOrbit", "starLoop", "openOrbit"],
  memorial: ["thinHalo", "spiralWhorl", "nestedRing"],
};

const POSITION_LIBRARY = [
  { x: 320, y: 330 },
  { x: 505, y: 275 },
  { x: 690, y: 350 },
  { x: 440, y: 470 },
  { x: 610, y: 520 },
  { x: 300, y: 555 },
  { x: 725, y: 610 },
  { x: 500, y: 680 },
  { x: 380, y: 735 },
  { x: 650, y: 745 },
  { x: 225, y: 430 },
  { x: 765, y: 455 },
];

function sumDigits(value: string) {
  return value
    .replace(/\D/g, "")
    .split("")
    .reduce((sum, n) => sum + Number(n), 0);
}

function dateParts(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return {
    month: d.getMonth() + 1,
    day: d.getDate(),
    year: d.getFullYear(),
  };
}

function chooseDesign(type: MilestoneType, seed: number): DesignId {
  const designs = TYPE_DESIGNS[type];
  return designs[seed % designs.length];
}

function spiroPath(mark: ArtworkMark, layer: number) {
  const design = DESIGN_LIBRARY[mark.design];
  const points = 2800;
  const petals = design.basePetals + ((mark.seed + layer) % 9);
  const R = mark.size * (0.38 + layer * 0.022);
  const r = R / Math.max(2.2, petals / 3.15);
  const offset = R * (design.offset + ((mark.seed % 7) - 3) * 0.018);
  const cycles = design.cycles + (mark.seed % 3);

  let d = "";

  for (let i = 0; i <= points; i++) {
    const t = (Math.PI * 2 * cycles * i) / points;

    let x = 0;
    let y = 0;

    if (design.mode === "epi") {
      x = (R + r) * Math.cos(t) - offset * Math.cos(((R + r) / r) * t);
      y = (R + r) * Math.sin(t) - offset * Math.sin(((R + r) / r) * t);
    }

    if (design.mode === "hypo") {
      x = (R - r) * Math.cos(t) + offset * Math.cos(((R - r) / r) * t);
      y = (R - r) * Math.sin(t) - offset * Math.sin(((R - r) / r) * t);
    }

    if (design.mode === "rose") {
      const k = petals / 6;
      const radius =
        R *
        (0.72 +
          0.42 * Math.cos(k * t) +
          0.08 * Math.sin((mark.seed % 8) * t));
      x = radius * Math.cos(t);
      y = radius * Math.sin(t);
    }

    if (design.mode === "whorl") {
      const grow = 0.28 + i / points;
      x =
        ((R - r) * Math.cos(t) +
          offset * Math.cos(((R - r) / r) * t)) *
        grow;
      y =
        ((R - r) * Math.sin(t) -
          offset * Math.sin(((R - r) / r) * t)) *
        grow;
    }

    const finalX = mark.x + x * design.sx * 0.48;
    const finalY = mark.y + y * design.sy * 0.48;

    d += i === 0 ? `M ${finalX} ${finalY}` : ` L ${finalX} ${finalY}`;
  }

  return d;
}

function SpiroDesign({ mark }: { mark: ArtworkMark }) {
  const design = DESIGN_LIBRARY[mark.design];

  return (
    <g transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
      {Array.from({ length: mark.density }).map((_, layer) => (
        <path
          key={layer}
          d={spiroPath(mark, layer)}
          fill="none"
          stroke={mark.color}
          strokeWidth={design.stroke}
          opacity={Math.max(0.14, design.opacity - layer * 0.055)}
        />
      ))}

      {design.hasHole && (
        <>
          <circle
            cx={mark.x}
            cy={mark.y}
            r={mark.size * mark.holeRatio}
            fill="#ffffff"
            stroke={mark.color}
            strokeWidth="0.9"
            opacity="0.9"
          />
          <circle
            cx={mark.x}
            cy={mark.y}
            r={mark.size * (mark.holeRatio + 0.05)}
            fill="none"
            stroke={mark.color}
            strokeWidth="0.7"
            opacity="0.28"
          />
        </>
      )}

      <circle
        cx={mark.x}
        cy={mark.y}
        r={Math.max(2.4, mark.size * 0.012)}
        fill={mark.color}
        opacity="0.9"
      />
    </g>
  );
}

function generateArtwork(milestones: Milestone[]): ArtworkMark[] {
  const valid = milestones
    .filter((m) => m.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return valid.map((m, index) => {
    const parts = dateParts(m.date);
    const seed = sumDigits(m.date);
    const position = POSITION_LIBRARY[index % POSITION_LIBRARY.length];
    const design = chooseDesign(m.type, seed);

    const yearDigits = String(parts.year)
      .split("")
      .reduce((sum, n) => sum + Number(n), 0);

    const size =
      95 +
      (parts.day % 19) * 4 +
      (seed % 11) * 3 +
      (m.type === "birth" ? 18 : 0) +
      (m.type === "marriage" ? 20 : 0) +
      (m.type === "anniversary20" ? 24 : 0);

    return {
      ...m,
      x: position.x + ((seed % 13) - 6) * 2.5,
      y: position.y + ((seed % 17) - 8) * 2.5,
      size,
      color: MONTH_COLORS[parts.month - 1],
      rotation: (seed * 11 + index * 29) % 360,
      design,
      seed,
      holeRatio: 0.09 + (parts.day % 9) * 0.01,
      density: Math.min(8, 3 + (yearDigits % 6)),
    };
  });
}

export default function App() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: crypto.randomUUID(), type: "birth", date: "" },
  ]);

  const artwork = useMemo(() => generateArtwork(milestones), [milestones]);

  function addMilestone() {
    setMilestones((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "birth", date: "" },
    ]);
  }

  function updateMilestone(id: string, patch: Partial<Milestone>) {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }

  function removeMilestone(id: string) {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          background: #f5efe6;
          color: #231b17;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .app {
          display: grid;
          grid-template-columns: minmax(420px, 560px) 1fr;
          gap: 48px;
          padding: 48px;
          min-height: 100vh;
        }

        .controls h1 {
          font-size: 42px;
          margin: 0 0 12px;
        }

        .controls p {
          font-size: 18px;
          line-height: 1.45;
          color: #6e6258;
          margin-bottom: 36px;
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .milestone-header button,
        .remove {
          border: 0;
          border-radius: 999px;
          background: #211814;
          color: white;
          font-weight: 700;
          padding: 14px 24px;
          cursor: pointer;
        }

        .milestone-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .milestone-row {
          display: grid;
          grid-template-columns: 54px 1fr 1.4fr auto;
          gap: 20px;
          align-items: center;
          background: #eee6da;
          border: 1px solid #ded4c5;
          border-radius: 24px;
          padding: 22px;
        }

        .number {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #e1d1b8;
          display: grid;
          place-items: center;
          color: #a67534;
          font-weight: 800;
          font-size: 22px;
        }

        label {
          display: flex;
          flex-direction: column;
          font-weight: 800;
          color: #6b5f55;
          gap: 8px;
        }

        select,
        input {
          font-size: 18px;
          border-radius: 14px;
          border: 1px solid #d2c7b8;
          padding: 12px 14px;
          background: white;
        }

        .remove {
          background: #e1d8ca;
          color: #2a211d;
        }

        .preview-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #d9d9d4;
          padding: 48px;
        }

        .maple-frame {
          width: min(78vh, 760px);
          aspect-ratio: 1 / 1;
          padding: 18px;
          border-radius: 0;
          background:
            linear-gradient(90deg, rgba(255,255,255,.25), rgba(0,0,0,.1)),
            repeating-linear-gradient(
              90deg,
              #d7a870 0px,
              #e2b97f 8px,
              #c9935b 17px,
              #e6c089 28px
            );
          box-shadow:
            18px 24px 34px rgba(0,0,0,.22),
            inset 0 0 0 1px rgba(91,55,28,.32),
            inset 0 0 0 3px rgba(255,255,255,.18);
        }

        .black-reveal {
          width: 100%;
          height: 100%;
          background: #171412;
          padding: 7px;
          border-radius: 0;
          box-shadow: inset 0 0 8px rgba(0,0,0,.75);
        }

        .paper-border {
          width: 100%;
          height: 100%;
          background: #fbf8f1;
          padding: 44px;
          border-radius: 0;
        }

        .artwork {
          width: 100%;
          height: 100%;
          display: block;
          background: #ffffff;
          border-radius: 0;
        }

        @media (max-width: 1100px) {
          .app { grid-template-columns: 1fr; }
          .preview-wrap { padding: 28px; }
        }
      `}</style>

      <main className="app">
        <section className="controls">
          <h1>Add milestone dates</h1>
          <p>
            Each milestone selects one individual Spirograph design from the
            library. The date controls its size, density, inner opening,
            rotation, color, and placement.
          </p>

          <div className="milestone-header">
            <strong>{milestones.length} milestones included</strong>
            <button onClick={addMilestone}>Add Milestone</button>
          </div>

          <div className="milestone-list">
            {milestones.map((m, index) => (
              <div className="milestone-row" key={m.id}>
                <div className="number">{index + 1}</div>

                <label>
                  Milestone
                  <select
                    value={m.type}
                    onChange={(e) =>
                      updateMilestone(m.id, {
                        type: e.target.value as MilestoneType,
                      })
                    }
                  >
                    {Object.entries(EVENT_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Date
                  <input
                    type="date"
                    value={m.date}
                    onChange={(e) =>
                      updateMilestone(m.id, { date: e.target.value })
                    }
                  />
                </label>

                <button className="remove" onClick={() => removeMilestone(m.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="preview-wrap">
          <div className="maple-frame">
            <div className="black-reveal">
              <div className="paper-border">
                <svg viewBox="0 0 1000 1000" className="artwork">
                  <rect width="1000" height="1000" fill="#ffffff" />

                  {artwork.length === 0 ? (
                    <text
                      x="500"
                      y="500"
                      textAnchor="middle"
                      fill="#a89d8c"
                      fontSize="24"
                      fontFamily="serif"
                    >
                      Add milestone dates to create your artwork
                    </text>
                  ) : (
                    <>
                      <path
                        d="M 130 720 C 210 260, 705 150, 840 570"
                        fill="none"
                        stroke="#87b9c7"
                        strokeWidth="1.05"
                        opacity="0.13"
                      />

                      {artwork.map((mark) => (
                        <SpiroDesign key={mark.id} mark={mark} />
                      ))}
                    </>
                  )}
                </svg>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
