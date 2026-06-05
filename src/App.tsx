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
  | "torus"
  | "rosette"
  | "orbit"
  | "star"
  | "halo"
  | "spiral";

type Milestone = {
  id: string;
  type: MilestoneType;
  date: string;
};

type SpiroMarkData = {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  family: SpiroFamily;
  seed: number;
  rings: number;
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

const COMPOSITION_POINTS = [
  { x: 365, y: 365 },
  { x: 570, y: 335 },
  { x: 665, y: 535 },
  { x: 470, y: 520 },
  { x: 365, y: 620 },
  { x: 560, y: 675 },
  { x: 725, y: 405 },
  { x: 285, y: 500 },
  { x: 700, y: 700 },
  { x: 430, y: 760 },
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

function familyFor(type: MilestoneType, seed: number): SpiroFamily[] {
  switch (type) {
    case "birth":
      return ["rosette", "torus", "halo"];
    case "firstDate":
      return ["orbit", "rosette", "halo"];
    case "engagement":
      return ["orbit", "halo", "torus"];
    case "marriage":
      return ["torus", "halo", "orbit"];
    case "child":
      return ["rosette", "halo", "orbit"];
    case "home":
      return ["spiral", "torus", "star"];
    case "anniversary10":
      return ["halo", "torus", "star"];
    case "anniversary20":
      return ["torus", "halo", "rosette"];
    case "graduation":
      return ["star", "halo", "orbit"];
    case "career":
      return ["star", "torus", "orbit"];
    case "memorial":
      return ["halo", "spiral", "torus"];
    default:
      return ["rosette", "torus", "halo"];
  }
}

function spiroPath(
  cx: number,
  cy: number,
  size: number,
  family: SpiroFamily,
  seed: number,
  ringIndex: number
) {
  let d = "";
  const points = 2400;

  const petals =
    family === "torus"
      ? 34 + ((seed + ringIndex) % 16)
      : family === "halo"
      ? 24 + ((seed + ringIndex) % 12)
      : family === "star"
      ? 6 + ((seed + ringIndex) % 7)
      : family === "orbit"
      ? 5 + ((seed + ringIndex) % 8)
      : family === "spiral"
      ? 9 + ((seed + ringIndex) % 9)
      : 12 + ((seed + ringIndex) % 14);

  const R = size;
  const r = size / Math.max(2.4, petals / 3.2);

  const offset =
    family === "torus"
      ? size * 0.66
      : family === "halo"
      ? size * 0.58
      : family === "star"
      ? size * 1.05
      : family === "orbit"
      ? size * 1.28
      : family === "spiral"
      ? size * 0.82
      : size * 0.76;

  const cycles =
    family === "torus"
      ? 20
      : family === "halo"
      ? 16
      : family === "star"
      ? 9
      : family === "orbit"
      ? 7
      : 12;

  const squashX =
    family === "orbit" ? 1.55 : family === "star" ? 1.1 : family === "spiral" ? 1.15 : 1;

  const squashY =
    family === "orbit" ? 0.72 : family === "star" ? 1.05 : family === "spiral" ? 0.95 : 1;

  for (let i = 0; i <= points; i++) {
    const t = (Math.PI * 2 * cycles * i) / points;

    let x: number;
    let y: number;

    if (family === "star" || family === "orbit") {
      x = (R + r) * Math.cos(t) - offset * Math.cos(((R + r) / r) * t);
      y = (R + r) * Math.sin(t) - offset * Math.sin(((R + r) / r) * t);
    } else if (family === "spiral") {
      const grow = 0.28 + i / points;
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

    const finalX = cx + x * squashX * 0.42;
    const finalY = cy + y * squashY * 0.42;

    d += i === 0 ? `M ${finalX} ${finalY}` : ` L ${finalX} ${finalY}`;
  }

  return d;
}

function SpiroMark({ mark }: { mark: SpiroMarkData }) {
  return (
    <g transform={`rotate(${mark.rotation} ${mark.x} ${mark.y})`}>
      {Array.from({ length: mark.rings }).map((_, i) => {
        const scale =
          mark.family === "torus" || mark.family === "halo"
            ? 0.42 + i * 0.035
            : mark.family === "orbit"
            ? 0.34 + i * 0.045
            : 0.36 + i * 0.04;

        return (
          <path
            key={i}
            d={spiroPath(mark.x, mark.y, mark.size * scale, mark.family, mark.seed, i)}
            fill="none"
            stroke={mark.color}
            strokeWidth={mark.family === "star" || mark.family === "orbit" ? 1.08 : 0.86}
            opacity={Math.max(0.18, 0.62 - i * 0.055)}
          />
        );
      })}

      {(mark.family === "torus" || mark.family === "halo") && (
        <circle
          cx={mark.x}
          cy={mark.y}
          r={mark.size * 0.17}
          fill="white"
          stroke={mark.color}
          strokeWidth="0.9"
          opacity="0.78"
        />
      )}

      <circle cx={mark.x} cy={mark.y} r={Math.max(2.5, mark.size * 0.012)} fill={mark.color} />
    </g>
  );
}

function generateCluster(m: Milestone, index: number): SpiroMarkData[] {
  const { month } = dateParts(m.date);
  const seed = sumDigits(m.date);
  const base = COMPOSITION_POINTS[index % COMPOSITION_POINTS.length];
  const colors = [
    MONTH_COLORS[month - 1],
    MONTH_COLORS[(month + 2) % 12],
    MONTH_COLORS[(month + 7) % 12],
  ];

  const families = familyFor(m.type, seed);

  const clusterCount =
    m.type === "birth" || m.type === "marriage" || m.type === "anniversary20"
      ? 7
      : m.type === "child" || m.type === "anniversary10"
      ? 5
      : 4;

  const baseSize =
    m.type === "birth"
      ? 160
      : m.type === "marriage"
      ? 175
      : m.type === "anniversary20"
      ? 170
      : m.type === "child"
      ? 130
      : 120;

  return Array.from({ length: clusterCount }).map((_, i) => {
    const angle = ((i * 137.507 + seed * 11) * Math.PI) / 180;
    const radius = i === 0 ? 0 : 28 + (i % 3) * 18 + (seed % 8);

    return {
      id: `${m.id}-${i}`,
      x: base.x + Math.cos(angle) * radius,
      y: base.y + Math.sin(angle) * radius,
      size: Math.max(70, baseSize - i * 12 + (seed % 18)),
      color: colors[i % colors.length],
      rotation: (seed * 9 + i * 31) % 360,
      family: families[i % families.length],
      seed: seed + i * 17,
      rings: i === 0 ? 7 : 3 + (i % 4),
    };
  });
}

function generateArtwork(milestones: Milestone[]) {
  return milestones
    .filter((m) => m.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .flatMap((m, index) => generateCluster(m, index));
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
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
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
            Each milestone now creates a cluster of related Spirograph forms,
            rather than a single flower.
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
                    onChange={(e) => updateMilestone(m.id, { date: e.target.value })}
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
                        opacity="0.16"
                      />
                      {artwork.map((mark) => (
                        <SpiroMark key={mark.id} mark={mark} />
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
