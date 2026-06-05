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

type SpiroFamily =
  | "rosette"
  | "torus"
  | "orbit"
  | "doubleOrbit"
  | "star"
  | "halo"
  | "spiral"
  | "looseBloom"
  | "denseBloom"
  | "homeMark";

type Milestone = {
  id: string;
  type: MilestoneType;
  date: string;
};

type ArtworkPoint = Milestone & {
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  family: SpiroFamily;
  libraryIndex: number;
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
  "#e2bd43",
  "#d18435",
  "#a94f3d",
  "#c98252",
  "#4f8a91",
  "#b68132",
  "#8f483b",
  "#b7a68c",
];

const TYPE_FAMILY: Record<MilestoneType, SpiroFamily[]> = {
  birth: ["rosette", "denseBloom", "looseBloom"],
  firstDate: ["orbit", "looseBloom"],
  engagement: ["doubleOrbit", "orbit"],
  marriage: ["torus", "doubleOrbit", "halo"],
  child: ["rosette", "looseBloom", "denseBloom"],
  home: ["spiral", "homeMark", "torus"],
  anniversary10: ["halo", "torus", "star"],
  anniversary20: ["torus", "halo", "denseBloom"],
  graduation: ["star", "rosette"],
  career: ["star", "orbit"],
  memorial: ["halo", "spiral"],
};

const POSITION_LIBRARY = [
  { x: 360, y: 405, size: 265 },
  { x: 565, y: 315, size: 255 },
  { x: 660, y: 560, size: 230 },
  { x: 485, y: 505, size: 260 },
  { x: 520, y: 660, size: 190 },
  { x: 350, y: 620, size: 185 },
  { x: 710, y: 410, size: 180 },
  { x: 425, y: 300, size: 185 },
  { x: 605, y: 735, size: 175 },
  { x: 285, y: 520, size: 180 },
  { x: 735, y: 705, size: 175 },
  { x: 275, y: 735, size: 165 },
];

function sumDigits(value: string) {
  return value
    .replace(/\D/g, "")
    .split("")
    .reduce((sum, n) => sum + Number(n), 0);
}

function dateParts(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return { month: d.getMonth() + 1, day: d.getDate() };
}

function chooseFamily(type: MilestoneType, seed: number): SpiroFamily {
  const options = TYPE_FAMILY[type];
  return options[seed % options.length];
}

function librarySettings(family: SpiroFamily, seed: number, day: number) {
  const variants = {
    rosette: [
      { petals: 14 + (day % 7), layers: 5, sx: 1, sy: 1, stroke: 1.05, opacity: 0.66 },
      { petals: 18 + (seed % 8), layers: 6, sx: 1, sy: 1, stroke: 0.95, opacity: 0.62 },
      { petals: 10 + (day % 6), layers: 4, sx: 1.08, sy: 0.95, stroke: 1.1, opacity: 0.68 },
    ],
    torus: [
      { petals: 32 + (seed % 12), layers: 8, sx: 1, sy: 1, stroke: 0.85, opacity: 0.58 },
      { petals: 42 + (day % 10), layers: 9, sx: 1.05, sy: 1.05, stroke: 0.78, opacity: 0.54 },
      { petals: 26 + (seed % 9), layers: 7, sx: 1.18, sy: 0.9, stroke: 0.9, opacity: 0.56 },
    ],
    orbit: [
      { petals: 5 + (seed % 5), layers: 3, sx: 1.65, sy: 0.7, stroke: 1.25, opacity: 0.72 },
      { petals: 7 + (day % 4), layers: 4, sx: 1.35, sy: 0.88, stroke: 1.15, opacity: 0.68 },
      { petals: 4 + (seed % 6), layers: 3, sx: 1.9, sy: 0.62, stroke: 1.1, opacity: 0.66 },
    ],
    doubleOrbit: [
      { petals: 10 + (seed % 5), layers: 4, sx: 1.28, sy: 0.92, stroke: 1.05, opacity: 0.64 },
      { petals: 13 + (day % 5), layers: 5, sx: 1.42, sy: 0.86, stroke: 0.95, opacity: 0.58 },
    ],
    star: [
      { petals: 8 + (day % 6), layers: 3, sx: 1, sy: 1, stroke: 1.25, opacity: 0.74 },
      { petals: 11 + (seed % 7), layers: 4, sx: 1.08, sy: 1.08, stroke: 1.1, opacity: 0.68 },
      { petals: 6 + (day % 5), layers: 3, sx: 1.15, sy: 0.95, stroke: 1.2, opacity: 0.72 },
    ],
    halo: [
      { petals: 24 + (seed % 10), layers: 6, sx: 1, sy: 1, stroke: 0.95, opacity: 0.58 },
      { petals: 30 + (day % 12), layers: 7, sx: 1.05, sy: 1.05, stroke: 0.86, opacity: 0.54 },
      { petals: 18 + (seed % 8), layers: 5, sx: 1.2, sy: 0.94, stroke: 0.9, opacity: 0.56 },
    ],
    spiral: [
      { petals: 9 + (seed % 8), layers: 5, sx: 1.18, sy: 1.05, stroke: 1, opacity: 0.6 },
      { petals: 13 + (day % 7), layers: 6, sx: 0.96, sy: 1.2, stroke: 0.95, opacity: 0.56 },
    ],
    looseBloom: [
      { petals: 6 + (seed % 7), layers: 3, sx: 1.25, sy: 0.85, stroke: 1.2, opacity: 0.68 },
      { petals: 9 + (day % 5), layers: 3, sx: 0.9, sy: 1.25, stroke: 1.12, opacity: 0.64 },
    ],
    denseBloom: [
      { petals: 20 + (day % 9), layers: 7, sx: 1, sy: 1, stroke: 0.86, opacity: 0.58 },
      { petals: 28 + (seed % 12), layers: 8, sx: 1.05, sy: 1.05, stroke: 0.8, opacity: 0.54 },
    ],
    homeMark: [
      { petals: 7 + (seed % 5), layers: 3, sx: 1.08, sy: 1.08, stroke: 1, opacity: 0.58 },
      { petals: 10 + (day % 4), layers: 4, sx: 1, sy: 1, stroke: 0.95, opacity: 0.56 },
    ],
  };

  const options = variants[family];
  return options[seed % options.length];
}

function spiroPath(
  cx: number,
  cy: number,
  size: number,
  petals: number,
  sx: number,
  sy: number,
  twist: number,
  seed: number,
  family: SpiroFamily
) {
  let d = "";
  const points = 2600;

  const R = size;
  const r = size / Math.max(2.2, petals / 3.2);

  const offset =
    family === "torus" || family === "halo"
      ? size * 0.62
      : family === "star"
      ? size * 0.95
      : family === "orbit"
      ? size * 1.25
      : family === "doubleOrbit"
      ? size * 0.85
      : family === "spiral"
      ? size * 0.74
      : size * 0.78;

  const cycles =
    family === "torus" || family === "halo"
      ? 18
      : family === "star"
      ? 9
      : family === "orbit"
      ? 7
      : 10;

  for (let i = 0; i <= points; i++) {
    const t = (Math.PI * 2 * cycles * i) / points;

    let x = 0;
    let y = 0;

    if (family === "star" || family === "orbit") {
      x = (R + r) * Math.cos(t) - offset * Math.cos(((R + r) / r) * t);
      y = (R + r) * Math.sin(t) - offset * Math.sin(((R + r) / r) * t);
    } else if (family === "spiral") {
      const grow = 0.35 + i / points;
      x =
        ((R - r) * Math.cos(t) +
          offset * Math.cos(((R - r) / r) * t)) *
        grow;
      y =
        ((R - r) * Math.sin(t) -
          offset * Math.sin(((R - r) / r) * t)) *
        grow;
    } else {
      x = (R - r) * Math.cos(t) + offset * Math.cos(((R - r) / r) * t);
      y = (R - r) * Math.sin(t) - offset * Math.sin(((R - r) / r) * t);
    }

    const finalX = cx + x * sx * 0.42;
    const finalY = cy + y * sy * 0.42;

    d += i === 0 ? `M ${finalX} ${finalY}` : ` L ${finalX} ${finalY}`;
  }

  return d;
}

function SpiroMark({ p }: { p: ArtworkPoint }) {
  const { day } = dateParts(p.date);
  const seed = sumDigits(p.date);
  const config = librarySettings(p.family, seed + p.libraryIndex, day);

  return (
    <g transform={`rotate(${p.rotation} ${p.x} ${p.y})`}>
      {Array.from({ length: config.layers }).map((_, layer) => {
        const scale =
          p.family === "torus" || p.family === "halo"
            ? 0.34 + layer * 0.018
            : 0.28 + layer * 0.024;

        const path = spiroPath(
          p.x,
          p.y,
          p.size * scale,
          config.petals + layer,
          config.sx,
          config.sy,
          layer * 0.32 + seed * 0.018,
          seed + layer,
          p.family
        );

        return (
          <path
            key={layer}
            d={path}
            fill="none"
            stroke={p.color}
            strokeWidth={config.stroke}
            opacity={Math.max(0.14, config.opacity - layer * 0.055)}
          />
        );
      })}

      {(p.family === "torus" || p.family === "halo") && (
        <>
          <circle
            cx={p.x}
            cy={p.y}
            r={p.size * 0.22}
            fill="white"
            stroke={p.color}
            strokeWidth="1"
            opacity="0.68"
          />
          <circle
            cx={p.x}
            cy={p.y}
            r={p.size * 0.3}
            fill="none"
            stroke={p.color}
            strokeWidth="0.9"
            opacity="0.32"
          />
        </>
      )}

      {p.family === "doubleOrbit" && (
        <>
          <circle
            cx={p.x - p.size * 0.11}
            cy={p.y}
            r={p.size * 0.18}
            fill="none"
            stroke={p.color}
            strokeWidth="1.15"
            opacity="0.5"
          />
          <circle
            cx={p.x + p.size * 0.11}
            cy={p.y}
            r={p.size * 0.18}
            fill="none"
            stroke={p.color}
            strokeWidth="1.15"
            opacity="0.5"
          />
        </>
      )}

      {p.family === "homeMark" && (
        <path
          d={`M ${p.x - p.size * 0.16} ${p.y + p.size * 0.1}
              L ${p.x - p.size * 0.16} ${p.y - p.size * 0.06}
              L ${p.x} ${p.y - p.size * 0.24}
              L ${p.x + p.size * 0.16} ${p.y - p.size * 0.06}
              L ${p.x + p.size * 0.16} ${p.y + p.size * 0.1}
              Z`}
          fill="none"
          stroke={p.color}
          strokeWidth="1.2"
          opacity="0.45"
        />
      )}

      <circle
        cx={p.x}
        cy={p.y}
        r={Math.max(3, p.size * 0.015)}
        fill={p.color}
        opacity="0.9"
      />
    </g>
  );
}

function generateArtwork(milestones: Milestone[]): ArtworkPoint[] {
  const valid = milestones
    .filter((m) => m.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return valid.map((m, index) => {
    const { month } = dateParts(m.date);
    const seed = sumDigits(m.date);
    const base = POSITION_LIBRARY[index % POSITION_LIBRARY.length];
    const family = chooseFamily(m.type, seed);

    let size = base.size;
    if (m.type === "birth") size += 30;
    if (m.type === "marriage") size += 20;
    if (m.type === "child") size -= 20;
    if (m.type === "home") size -= 25;
    if (m.type === "firstDate") size -= 10;
    if (m.type === "anniversary20") size += 25;

    return {
      ...m,
      x: base.x + ((seed % 15) - 7) * 2.2,
      y: base.y + ((seed % 13) - 6) * 2.2,
      size,
      color: MONTH_COLORS[month - 1],
      rotation: (seed * 9 + index * 31) % 360,
      family,
      libraryIndex: seed % 3,
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
          box-shadow:
            inset 0 0 0 1px rgba(0,0,0,.08),
            inset 0 0 18px rgba(0,0,0,.04);
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
            Each date becomes part of one organic artwork. Milestone type,
            date, color, shape, and placement are interpreted automatically.
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
                        d="M 110 715 C 180 250, 700 125, 835 560 C 900 780, 430 835, 375 515"
                        fill="none"
                        stroke="#87b9c7"
                        strokeWidth="1.15"
                        opacity="0.22"
                      />
                      <path
                        d="M 190 790 C 255 360, 580 205, 790 430"
                        fill="none"
                        stroke="#87b9c7"
                        strokeWidth="0.8"
                        opacity="0.13"
                      />

                      {artwork.map((p) => (
                        <SpiroMark key={p.id} p={p} />
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
